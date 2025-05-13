import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Box,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useClient } from '../services/rpc-client';
import { MovieService, type MovieWithComments } from '../gen/movie_pb';
import { UserService } from '../gen/movie_pb';
import { useAuth } from '../contexts/AuthContext';

function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieWithComments | null>(null);
  const [loading, setLoading] = useState(true);
  const movieService = useClient(MovieService);
  const userService = useClient(UserService);
  const { user, isAuthenticated, updateUser } = useAuth();

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        const response = await movieService.getMovieWithComments({ id: id! });
        setMovie(response.data[0]);
      } catch (error) {
        console.error('Failed to load movie:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMovie();
    }
  }, [id]);

  const handleFavorite = async () => {
    if (!isAuthenticated || !user || !movie) return;

    try {
      if (user.favoriteMovieIds.includes(movie.Id)) {
        await userService.deleteFavoriteMovie({ email: user.email, movieId: movie.Id });
      } else {
        await userService.addFavoriteMovie({ email: user.email, movieId: movie.Id });
      }
      // Fetch updated user data
      const response = await userService.getUser({ email: user.email });
      if (response) {
        updateUser(response);
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container>
        <Typography>Movie not found</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <img
            src={movie.poster || 'https://via.placeholder.com/300x400'}
            alt={movie.title}
            style={{ width: '100%', borderRadius: '8px' }}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
              {movie.title}
            </Typography>
            {isAuthenticated && (
              <IconButton onClick={handleFavorite} size="large">
                {user?.favoriteMovieIds.includes(movie.Id) ? (
                  <Favorite color="error" />
                ) : (
                  <FavoriteBorder />
                )}
              </IconButton>
            )}
          </Box>
          <Typography variant="body1" paragraph>
            {movie.plot}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Runtime: {movie.runtime} minutes
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Released: {movie.released ? new Date(Number(movie.released?.seconds) * 1000 + Number(movie.released?.nanos) / 1e6).toLocaleDateString() : 'N/A'}
          </Typography>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {movie.comments?.map((comment: any) => (
            <ListItem key={comment.Id} alignItems="flex-start">
              <ListItemText
                primary={comment.name}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {new Date(comment.date).toLocaleDateString()}
                    </Typography>
                    {` — ${comment.text}`}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default MovieDetail; 