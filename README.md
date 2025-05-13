# Movie Catalog Web App

A React-based web application for browsing movies, viewing comments, and managing favorite movies. The app uses gRPC for backend communication and Google OAuth for authentication.

## Features

- User authentication via Google Social Sign-in
- Browse movie catalog with pagination
- View movie details and comments
- Add/remove movies from favorites
- View favorite movies list

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- buf
   - See [here](https://buf.build/docs/cli/installation/) for installation instructions
- Google OAuth credentials
   - If you don't have one already, you will need to create a new web OAuth 2.0 client in GCP Console. You can follow [these instructions](https://developers.google.com/identity/protocols/oauth2). You will also need to add "http://localhost:5173" as *both* an Authorized JavaScript origin and an Authorized redirect URI.
- Atlas cluster with preloaded [mflix sample dataset](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix/)

## Backend setup

1. Update MongoDB URL in the config file in ./dapi_files with the Atlas connection string

2. Compile the protobuf file
   ```bash
   cd ./dapi_files
   buf build -o protos.pb
   ```
   This will generate ./dapi_files/protos.pb file
   
3. Register at https://dapi-sandbox.adiom.io/ and create a new service using the config file and the compiled protos file.

## Fronted setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Google OAuth client ID and Data API sandbox key:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_ADIOM_DAPI_URL=https://dapi-sandbox.adiom.io:8080
   VITE_ADIOM_DAPI_KEY=your_sandbox_api_key_here
   ```

4. Generate TypeScript code from protobuf definitions:
   ```bash
   npm run generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development

The application is built with:
- React + TypeScript
- Material-UI for components
- Connect RPC for gRPC communication
- React Router for navigation
- Google OAuth for authentication

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/services/` - Service layer for API communication
- `src/contexts/` - React contexts for state management
- `src/gen/` - Generated TypeScript code from protobuf definitions

## API Communication

The application communicates with the backend using gRPC through Connect RPC. The protobuf definitions are in the `proto/` directory, and the generated TypeScript code is in `src/gen/`.

## Authentication

The app uses Google OAuth for authentication. Users need to sign in with their Google account to access features like adding movies to favorites.
