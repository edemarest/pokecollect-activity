import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../utils/api";
import "../styles/leaderboard.css";
import RollLog from "./RollLog";

// ErrorBoundary: Catches and displays errors in leaderboard
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Error logging (optional)
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 16 }}>Leaderboard error: {this.state.error?.toString()}</div>;
    }
    return this.props.children;
  }
}

// Leaderboard displays player rankings and avatars
export default function Leaderboard({ playerUserId, collection, showAvatars, usernamesMap, refreshKey, rollLog }) {
  // --- State ---
  const [players, setPlayers] = useState([]);
  const [dexToName, setDexToName] = useState({});

  // --- Effects: Fetch leaderboard and mapping ---
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard();
        setPlayers(data);
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  useEffect(() => {
    fetch("/data/dexToName.json")
      .then(res => res.json())
      .then(setDexToName)
      .catch(() => setDexToName({}));
  }, []);

  // --- Render ---
  return (
    <ErrorBoundary>
      <div className="leaderboard-root">
        <h3 className="leaderboard-title">Leaderboard</h3>
        {players.length === 0 ? (
          <div className="leaderboard-empty">No players yet.</div>
        ) : (
          <ol className="leaderboard-list">
            {players.map((p, i) => (
              <li
                key={p.userId}
                className={
                  "leaderboard-row" +
                  (p.userId === playerUserId ? " leaderboard-row-self" : "")
                }
              >
                <span className="leaderboard-rank">{i + 1}.</span>
                <span className="leaderboard-avatar">
                  {showAvatars && (p.avatarImage || p.avatarDexNumber) ? (
                    <img
                      src={
                        p.avatarImage
                          ? p.avatarImage.startsWith('/') ? p.avatarImage : '/' + p.avatarImage
                          : p.avatarDexNumber
                            ? `/pokemon/${dexToName[p.avatarDexNumber] || "unknown"}.png`
                            : undefined
                      }
                      alt="avatar"
                      className="leaderboard-avatar-img"
                    />
                  ) : (
                    <span className="leaderboard-avatar-placeholder">?</span>
                  )}
                </span>
                <span className="leaderboard-username">
                  {(usernamesMap && usernamesMap[p.userId]) ? usernamesMap[p.userId] : p.userId}
                </span>
                <span className="leaderboard-power">{p.power}</span>
              </li>
            ))}
          </ol>
        )}
        <RollLog log={rollLog} />
      </div>
    </ErrorBoundary>
  );
}
