import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../utils/api";

// Simple error boundary for debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // You can log error info here
    console.error("Leaderboard error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 16 }}>Leaderboard error: {this.state.error?.toString()}</div>;
    }
    return this.props.children;
  }
}

export default function Leaderboard({ playerUserId, collection }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard();
        setPlayers(data);
        console.log("Leaderboard data:", data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      }
    }
    fetchLeaderboard();
    // Optionally, poll every 10s for updates
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [collection]); // refetch when local collection changes

  return (
    <ErrorBoundary>
      <div style={{ background: "#181818", borderRadius: 12, padding: 16, minWidth: 260, maxWidth: 320, boxShadow: "0 2px 12px #0006", marginBottom: 24 }}>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>Leaderboard</h3>
        {players.length === 0 ? (
          <div style={{ color: "#aaa" }}>No players yet.</div>
        ) : (
          <ol style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {players.map((p, i) => (
              <li key={p.userId} style={{
                background: p.userId === playerUserId ? "#333" : "transparent",
                borderRadius: 8,
                padding: "6px 8px",
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                fontWeight: p.userId === playerUserId ? "bold" : "normal"
              }}>
                <span style={{ width: 22, display: "inline-block", textAlign: "right", marginRight: 8 }}>{i + 1}.</span>
                {/* Placeholder avatar */}
                <span style={{ width: 32, height: 32, display: "inline-block", marginRight: 8 }}>
                  {p.avatarDexNumber ? (
                    <img src={collection.find(c => c.dexNumber === p.avatarDexNumber)?.image || ""} alt="avatar" style={{ width: 28, height: 28, borderRadius: 6, border: "2px solid #4caf50" }} />
                  ) : (
                    <span style={{ color: "#888" }}>?</span>
                  )}
                </span>
                <span style={{ flex: 1 }}>{p.userId}</span>
                <span style={{ marginLeft: 8, color: "#4caf50" }}>{p.power}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </ErrorBoundary>
  );
}
