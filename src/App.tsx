import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import Navbar from './components/Navbar';
import MovieList from './pages/MovieList';
import MovieDetail from './pages/MovieDetail';
import Favorites from './pages/Favorites';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  <Route path="/" element={<MovieList />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  <Route
                    path="/favorites"
                    element={
                      <PrivateRoute>
                        <Favorites />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
