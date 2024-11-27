import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [characters, setCharacters] = useState([]);
  const [leftCharacter, setLeftCharacter] = useState(null);
  const [rightCharacter, setRightCharacter] = useState(null);
  const [leaderboard, setLeaderboard] = useState({});
  const [iteration, setIteration] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Fetch a random anime character
  const fetchRandomCharacter = async () => {
    const randomId = Math.floor(Math.random() * 10000); // Randomize character ID
    try {
      const res = await axios.get(
        `https://api.jikan.moe/v4/characters/${randomId}`
        `https://api.jikan.moe/v4/characters/${randomId}/anime`
      );
      return {
        id: res.data.data.mal_id,
        name: res.data.data.name,
        image: res.data.data.images.jpg.image_url,
        anime: res.data.data.animeid
      };
    } catch (error) {
      return fetchRandomCharacter(); // Retry on failure
    }
  };

  // Initialize characters
  useEffect(() => {
    const loadCharacters = async () => {
      const char1 = await fetchRandomCharacter();
      const char2 = await fetchRandomCharacter();
      setLeftCharacter(char1);
      setRightCharacter(char2);
    };
    loadCharacters();
  }, []);

  // Handle character click
  const handleClick = async (selectedSide) => {
    const clickedCharacter =
      selectedSide === "left" ? leftCharacter : rightCharacter;

    // Update leaderboard
    setLeaderboard((prev) => ({
      ...prev,
      [clickedCharacter.id]: (prev[clickedCharacter.id] || 0) + 1,
    }));

    // Check for game over
    if (iteration + 1 >= 100) {
      setGameOver(true);
      return;
    }

    // Replace non-clicked character
    const newCharacter = await fetchRandomCharacter();
    if (selectedSide === "left") {
      setRightCharacter(newCharacter);
    } else {
      setLeftCharacter(newCharacter);
    }

    // Increment iteration
    setIteration((prev) => prev + 1);
  };

  if (gameOver) {
    // Calculate winner
    const sortedLeaderboard = Object.entries(leaderboard).sort(
      (a, b) => b[1] - a[1]
    );
    const winnerId = sortedLeaderboard[0][0];
    const winnerData = characters.find((char) => char.id === parseInt(winnerId));

    return (
      <div className="leaderboard">
        <h1>Leaderboard</h1>
        {sortedLeaderboard.map(([id, count], index) => (
          <div
            key={id}
            className={`leaderboard-item ${
              index === 0 ? "winner" : ""
            }`}
          >
            <img
              src={
                characters.find((char) => char.id === parseInt(id))?.image
              }
              alt="Winner"
            />
            <p>{characters.find((char) => char.id === parseInt(id))?.name}</p>
            <p>Clicks: {count}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Who Would Win?</h1>
      <div className="character-container">
        <div
          className="character"
          onClick={() => handleClick("left")}
        >
          {leftCharacter && (
            <>
              <img src={leftCharacter.image} alt={leftCharacter.name} />
              <p>{leftCharacter.name}</p>
            </>
          )}
        </div>
        <div
          className="character"
          onClick={() => handleClick("right")}
        >
          {rightCharacter && (
            <>
              <img src={rightCharacter.image} alt={rightCharacter.name} />
              <p>{rightCharacter.name}</p>
            </>
          )}
        </div>
      </div>
      <p>Iteration: {iteration} / 100</p>
    </div>
  );
}

export default App;
