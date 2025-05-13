import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
} from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useClient } from '../services/rpc-client';
import { MovieService, type Movie } from '../gen/movie_pb';
import { UserService } from '../gen/movie_pb';
import { useAuth } from '../contexts/AuthContext';

function Favorites() {
  const [favoriteMovies, setFavoriteMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const movieService = useClient(MovieService);
  const userService = useClient(UserService);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    const loadFavoriteMovies = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const movies = await Promise.all(
          user.favoriteMovieIds.map(async (movieId) => {
            const response = await movieService.getMovieWithComments({ id: movieId });
            return response.data[0];
          })
        );
        setFavoriteMovies(movies);
      } catch (error) {
        console.error('Failed to load favorite movies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteMovies();
  }, [user]);

  const handleRemoveFavorite = async (movieId: string) => {
    if (!user) return;

    try {
      await userService.deleteFavoriteMovie({ email: user.email, movieId });
      // Fetch updated user data
      const response = await userService.getUser({ email: user.email });
      if (response) {
        updateUser(response);
      }
      // Update local state
      setFavoriteMovies(prev => prev.filter(movie => movie.Id !== movieId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Favorite Movies
      </Typography>
      <Grid container spacing={4}>
        {favoriteMovies.map((movie: Movie) => (
          <Grid item key={movie.Id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="400"
                image={movie.poster || 'https://via.placeholder.com/300x400'}
                alt={movie.title}
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/movie/${movie.Id}`)}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {movie.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {movie.plot}
                </Typography>
                <IconButton
                  onClick={() => handleRemoveFavorite(movie.Id)}
                  sx={{ mt: 1 }}
                >
                  <Favorite color="error" />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Favorites; 