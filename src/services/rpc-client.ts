import { useMemo } from "react";
import { type DescService } from "@bufbuild/protobuf";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient, type Client } from "@connectrpc/connect";

// const transport = createConnectTransport({
//   baseUrl: "http://localhost:8085",
//   interceptors: [
//     (next) => async (req) => {
//       const token = localStorage.getItem("token");
//       if (token) {
//         req.header.set("authorization", `Bearer ${token}`);
//       }
//       return await next(req);
//     },
//   ],
// });

const transport = createConnectTransport({
  baseUrl: import.meta.env.VITE_ADIOM_DAPI_URL,
  interceptors: [
    (next) => async (req) => {
      const token = localStorage.getItem("token");
      if (token) {
        req.header.set("authorization", `Bearer ${token}`);
      }
      req.header.set("dapi-key", import.meta.env.VITE_ADIOM_DAPI_KEY);
      return await next(req);
    },
  ],
});

export function useClient<T extends DescService>(service: T): Client<T> {
  return useMemo(() => createClient(service, transport), [service]);
} 