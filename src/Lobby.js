import React, { useState, useEffect, useCallback } from 'react';

function Lobby({ playerName, gameId, isHost, gameStarted }) {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [gameWord, setGameWord] = useState('');
  const [playerRole, setPlayerRole] = useState('');

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch(`https://qq4vbcrtkf.execute-api.us-east-1.amazonaws.com/dev/getGameDetails/${gameId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      const data = await response.json();
      setPlayers(data.players || []);
      setGameStatus(data.status || 'waiting');
      
      if (data.status === 'started') {
        const currentPlayer = data.players.find(player => player.playerName === playerName);
        setPlayerRole(currentPlayer ? currentPlayer.role : 'Unknown');
        if (currentPlayer?.role === 'Civilian') {
          setGameWord(data.word);
        } else if (currentPlayer?.role === 'Mafia') {
          setGameWord('You are the Mafia, find and eliminate the civilians!');
        }
      }
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to fetch players. Please check the console for more information.');
    }
  }, [gameId, playerName]);

  useEffect(() => {
    fetchPlayers();
    const intervalId = setInterval(fetchPlayers, 5000);
    return () => clearInterval(intervalId);
  }, [fetchPlayers]);

  return (
    <>
      <h2>Hi {playerName}, {isHost ? 'you are the host' : 'you are a player'}</h2>
      <p>Game ID: {gameId}</p>
      {gameStatus === 'started' && playerRole === 'Mafia' && <p>{gameWord}</p>}
      {gameStatus === 'started' && playerRole === 'Civilian' && <p>The word is: {gameWord}</p>}
      {error && <p className="error">{error}</p>}
      <div>Total Players: {players.length}</div>
      {players.map((player, index) => (
        <div key={index}>{player.playerName}</div> // Only show player names, not roles
      ))}
    </>
  );
}

export default Lobby;
