import React, { useState } from 'react';
import Lobby from './Lobby'; // Ensure Lobby.js is updated as previously described
import { withAuthenticator } from '@aws-amplify/ui-react';
import { CssBaseline, Container, Typography, Button, TextField, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff9800',
    },
  },
});

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [isGameCreated, setIsGameCreated] = useState(false);
  const [showJoinGameForm, setShowJoinGameForm] = useState(false);
  const [joinGameCode, setJoinGameCode] = useState('');
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const createGameSession = async () => {
    if (!playerName.trim()) {
      setError('Player name is required.');
      return;
    }

    try {
      const response = await fetch('https://qq4vbcrtkf.execute-api.us-east-1.amazonaws.com/dev/SetupGameLobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setGameId(data.gameId);
      setIsGameCreated(true);
      setIsHost(true);
      setGameStarted(false); // Reset for a new game
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error creating game session:', err);
      setError('Failed to create game session. Please check the console for more information.');
    }
  };

  const toggleJoinGameForm = () => {
    setShowJoinGameForm(!showJoinGameForm);
  };

  const handleJoinGameSubmit = async (e) => {
    e.preventDefault();

    if (!playerName.trim() || !joinGameCode.match(/^\d{3}-\d{3}$/)) {
      setError('Both name and a valid game code are required.');
      return;
    }

    try {
      const response = await fetch('https://qq4vbcrtkf.execute-api.us-east-1.amazonaws.com/dev/joinGameSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, gameId: joinGameCode }),
      });

      if (!response.ok) throw new Error('Failed to join game');

      setGameId(joinGameCode);
      setIsGameCreated(true);
      setShowJoinGameForm(false);
      setIsHost(false);
      setGameStarted(false); // Reset when joining an existing game
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game. Please check the console for more information.');
    }
  };

  const startGame = async () => {
    try {
      const response = await fetch('https://qq4vbcrtkf.execute-api.us-east-1.amazonaws.com/dev/startGameSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      if (!response.ok) throw new Error('Failed to start the game');

      setGameStarted(true);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error starting the game:', err);
      setError('Failed to start the game. Please check the console for more information.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="sm" sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom color="primary"  >
          <h1>Word Mafia</h1>
        </Typography>
        {!isGameCreated && !showJoinGameForm && (
          <>
            <TextField
              fullWidth
              label="Player Name"
              variant="outlined"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={createGameSession} sx={{ mb: 2 }}>
              Create New Game
            </Button>
            <Button variant="contained" color="primary" fullWidth onClick={toggleJoinGameForm}>
              Join Existing Game
            </Button>
          </>
        )}
        {showJoinGameForm && (
          <form onSubmit={handleJoinGameSubmit}>
            <TextField
              fullWidth
              label="Player Name"
              variant="outlined"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Game Code (e.g., 123-456)"
              variant="outlined"
              value={joinGameCode}
              onChange={(e) => setJoinGameCode(e.target.value)}
              inputProps={{ pattern: "\\d{3}-\\d{3}" }}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Join Game
            </Button>
          </form>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {isGameCreated && (
          <Lobby playerName={playerName} gameId={gameId} isHost={isHost} gameStarted={gameStarted} />
        )}
        {isGameCreated && !gameStarted && isHost && (
          <Button onClick={startGame} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Start Game
          </Button>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);
