import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useClient } from '../services/rpc-client';
import { MovieService, type Movie } from '../gen/movie_pb';
import { UserService } from '../gen/movie_pb';
import { useAuth } from '../contexts/AuthContext';

function MovieList() {
  const [movies, setMovies] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const movieService = useClient(MovieService);
  const userService = useClient(UserService);
  const { user, updateUser } = useAuth();

  const loadMovies = async (cursor: string = '') => {
    try {
      setLoading(true);
      const response = await movieService.list({ cursor });
      setMovies(prev => cursor ? [...prev, ...response.data] : response.data);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to load movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleFavorite = async (movieId: string) => {
    if (!user) return;

    try {
      if (user.favoriteMovieIds.includes(movieId)) {
        await userService.deleteFavoriteMovie({ email: user.email, movieId });
      } else {
        await userService.addFavoriteMovie({ email: user.email, movieId });
      }

      // Fetch updated user data
      const response = await userService.getUser({ email: user.email });
      if (response) {
        updateUser(response);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {movies.map((movie: Movie) => (
          <Grid component="div" item key={movie.Id} xs={12} sm={6} md={4} lg={3}>
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
                {user && (
                  <IconButton
                    onClick={() => handleFavorite(movie.Id)}
                    sx={{ mt: 1 }}
                  >
                    {user.favoriteMovieIds.includes(movie.Id) ? (
                      <Favorite color="error" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {nextCursor && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => loadMovies(nextCursor)}
            disabled={loading}
          >
            Load More
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default MovieList; 