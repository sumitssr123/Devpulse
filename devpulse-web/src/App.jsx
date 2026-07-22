import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. Set up state to hold the data from C++
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. useEffect runs automatically when the component loads
  useEffect(() => {
    // Send an HTTP GET request to your C++ API
    fetch('http://localhost:8080/api/leaderboard')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Parse the raw text into a JavaScript object
        return response.json();
      })
      .then((data) => {
        // Save the C++ data into our React state variable
        setLeaderboard(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching from C++ backend:", err);
        setError("Could not connect to the C++ server. Is it running?");
        setIsLoading(false);
      });
  }, []); // The empty array [] tells React to only run this once

  // 3. Render the UI based on the current state
  return (
    <div className="dashboard">
      <h1>DevPulse Web</h1>
      <h2>Global Leaderboard</h2>
      
      {/* Conditional rendering: Show loading or error states */}
      {isLoading && <p>Loading data from C++ server...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* When data is ready, render the table */}
      {!isLoading && !error && (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Total Solved</th>
              <th>Total Rating</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user) => (
              <tr key={user.rank}>
                <td>#{user.rank}</td>
                <td>{user.username}</td>
                <td>{user.total_solved}</td>
                <td>{user.total_rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;