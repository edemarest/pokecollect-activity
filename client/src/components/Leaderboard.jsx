import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../utils/api";
import dexToName from "../data/dexToName.json";

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

export default function Leaderboard({ playerUserId, collection, showAvatars, usernamesMap }) {
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
      <div style={{ background: "#181818", borderRadius: 12, padding: 16, minWidth: 260, maxWidth: 400, boxShadow: "0 2px 12px #0006", margin: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18, textAlign: 'center', letterSpacing: 1 }}>Leaderboard</h3>
        {players.length === 0 ? (
          <div style={{ color: "#aaa" }}>No players yet.</div>
        ) : (
          <ol style={{ padding: 0, margin: 0, listStyle: "none", flex: 1 }}>
            {players.map((p, i) => (
              <li key={p.userId} style={{
                background: p.userId === playerUserId ? "#333" : "transparent",
                borderRadius: 8,
                padding: "8px 8px",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                fontWeight: p.userId === playerUserId ? "bold" : "normal",
                gap: 10
              }}>
                <span style={{ width: 22, display: "inline-block", textAlign: "right", marginRight: 8 }}>{i + 1}.</span>
                {/* Avatar */}
                <span style={{ width: 36, height: 36, display: "inline-block", marginRight: 8 }}>
                  {showAvatars && (p.avatarImage || p.avatarDexNumber) ? (
                    <img
                      src={
                        p.avatarImage
                          ? p.avatarImage
                          : p.avatarDexNumber
                            ? `pokemon/${dexToName[p.avatarDexNumber] || "unknown"}.png`
                            : undefined
                      }
                      alt="avatar"
                      style={{ width: 32, height: 32, borderRadius: 8, border: "2px solid #4caf50", background: '#222' }}
                    />
                  ) : (
                    <span style={{ color: "#888", fontSize: 24 }}>?</span>
                  )}
                </span>
                <span style={{ flex: 1, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(usernamesMap && usernamesMap[p.userId]) ? usernamesMap[p.userId] : p.userId}
                </span>
                <span style={{ marginLeft: 8, color: "#4caf50", fontWeight: 600, fontSize: 15 }}>{p.power}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </ErrorBoundary>
  );
}
