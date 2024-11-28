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
  const [usedCharacterIds, setUsedCharacterIds] = useState([]);
  const [slamAnimation, setSlamAnimation] = useState(null);

  // List of anime IDs
  const animeIds = [
    5114, 40028, 6033, 31964, 51009, 14719, 20899, 26055, 31933, 7991, 11061, 2904,
  ];

  const fetchCharactersFromAnime = async (animeId) => {
    try {
      const animeRes = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);
      const animeTitle = animeRes.data.data.title;

      const res = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}/characters`);
      return res.data.data
        .filter((character) => character.character.name && character.character.images?.jpg) // Exclude incomplete characters
        .map((character) => ({
          id: character.character.mal_id,
          name: character.character.name,
          image: character.character.images.jpg.image_url,
          anime: animeTitle,
        }));
    } catch (error) {
      console.error(`Error fetching characters for anime ID ${animeId}:`, error);
      return [];
    }
  };

  const fetchRandomCharacter = async () => {
    try {
      const randomAnimeId = animeIds[Math.floor(Math.random() * animeIds.length)];
      const characters = await fetchCharactersFromAnime(randomAnimeId);

      if (characters.length > 0) {
        let newCharacter;
        do {
          newCharacter = characters[Math.floor(Math.random() * characters.length)];
        } while (usedCharacterIds.includes(newCharacter.id)); // Ensure unique ID

        setUsedCharacterIds((prev) => [...prev, newCharacter.id]);
        return newCharacter;
      } else {
        console.error("No characters found for the selected anime.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching random character:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadCharacters = async () => {
      const char1 = await fetchRandomCharacter();
      const char2 = await fetchRandomCharacter();

      if (char1 && char2) {
        setLeftCharacter(char1);
        setRightCharacter(char2);
        setCharacters((prev) => [...prev, char1, char2]);
      } else {
        console.error("Failed to load initial characters.");
      }
    };

    loadCharacters();
  }, []);

  const handleClick = async (selectedSide) => {
    setSlamAnimation(selectedSide);

    setTimeout(async () => {
      const clickedCharacter =
        selectedSide === "left" ? leftCharacter : rightCharacter;

      if (clickedCharacter) {
        setLeaderboard((prev) => ({
          ...prev,
          [clickedCharacter.id]: (prev[clickedCharacter.id] || 0) + 1,
        }));
      }

      if (iteration + 1 >= 50) {
        setGameOver(true);
        return;
      }

      const newCharacter = await fetchRandomCharacter();

      if (newCharacter) {
        if (selectedSide === "left") {
          setRightCharacter({ ...rightCharacter, fadeOut: true });
          setTimeout(() => setRightCharacter(newCharacter), 150);
        } else {
          setLeftCharacter({ ...leftCharacter, fadeOut: true });
          setTimeout(() => setLeftCharacter(newCharacter), 150);
        }
        setCharacters((prev) => [...prev, newCharacter]);
      }

      setIteration((prev) => prev + 1);
      setSlamAnimation(null);
    }, 500); // Faster animation duration
  };

  const handleReset = () => {
    window.location.reload(); // Simple refresh to restart
  };

  if (gameOver) {
    const sortedLeaderboard = Object.entries(leaderboard).sort(
      (a, b) => b[1] - a[1]
    );

    return (
      <div className="leaderboard">
        <h1>Leaderboard</h1>
        {sortedLeaderboard.map(([id, count], index) => {
          const char = characters.find((c) => c?.id === parseInt(id));
          return (
            <div
              key={id}
              className={`leaderboard-item ${index === 0 ? "winner" : ""}`}
            >
              <img src={char?.image} alt={char?.name || "Unknown"} />
              <p>{char?.name || "Unknown"}</p>
              <p>Wins: {count}</p>
            </div>
          );
        })}
        <button onClick={handleReset} className="reset-button">
          Restart Game
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Who Would Win?</h1>
      <div className="character-container">
        <div
          className={`character ${slamAnimation === "left" ? "slam-left" : ""} ${
            leftCharacter?.fadeOut ? "fade-out" : ""
          }`}
          onClick={() => handleClick("left")}
        >
          {leftCharacter ? (
            <>
              <img src={leftCharacter.image} alt={leftCharacter.name} />
              <p>{leftCharacter.name}</p>
              <p>{leftCharacter.anime}</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <div
          className={`character ${slamAnimation === "right" ? "slam-right" : ""} ${
            rightCharacter?.fadeOut ? "fade-out" : ""
          }`}
          onClick={() => handleClick("right")}
        >
          {rightCharacter ? (
            <>
              <img src={rightCharacter.image} alt={rightCharacter.name} />
              <p>{rightCharacter.name}</p>
              <p>{rightCharacter.anime}</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      <p>Round: {iteration} / 50</p>
    </div>
  );
}

export default App;
