import React, { useState } from 'react';

function GameLobby({ onCreateGame, gameId, players }) {
  const [playerName, setPlayerName] = useState('');
  const [joinGameId, setJoinGameId] = useState('');

  const handleCreateGameSession = async (e) => {
    e.preventDefault();
    onCreateGame(playerName);
  };

  // Placeholder for join game session logic
  const handleJoinGameSession = async (e) => {
    e.preventDefault();
    // Implement join game session logic here
    console.log('Joining game:', joinGameId, 'as', playerName);
  };

  return (
    <div>
      <h2>Game Lobby</h2>
      <form onSubmit={handleCreateGameSession}>
        <input
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button type="submit">Create New Game</button>
      </form>
      <form onSubmit={handleJoinGameSession}>
        <input
          type="text"
          placeholder="Game ID"
          value={joinGameId}
          onChange={(e) => setJoinGameId(e.target.value)}
        />
        <button type="submit">Join Game</button>
      </form>
      {gameId && (
        <>
          <div>Game ID: {gameId}</div>
          <div>Players: {players.map(player => player.playerName).join(", ")}</div>
        </>
      )}
    </div>
  );
}

export default GameLobby;
