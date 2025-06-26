import React, { useEffect, useState } from "react";
import "../styles/log.css";

// RollLog displays recent rare roll events
export default function RollLog({ log = [] }) {
  // --- State: Rarity styles for coloring ---
  const [rarityStyles, setRarityStyles] = useState({});

  // --- Effect: Fetch rarity styles ---
  useEffect(() => {
    fetch("/data/rarityStyles.json")
      .then(res => res.json())
      .then(setRarityStyles)
      .catch(() => setRarityStyles({}));
  }, []);

  // --- Render: List of recent rolls ---
  if (!log.length) return null;
  return (
    <div className="rolllog-root">
      <div className="rolllog-title">Recent Rare Rolls</div>
      <ul className="rolllog-list">
        {log.slice(-20).reverse().map((entry, i) => (
          <li key={entry.timestamp + (entry.username || "") + (entry.name || "") + i} className="rolllog-entry">
            {entry.system ? (
              <span className="rolllog-system">{entry.message}</span>
            ) : (
              <>
                <span className="rolllog-username" style={{ color: "#4fc3f7" }}>
                  {entry.username}
                </span>
                <span className="rolllog-text"> just rolled </span>
                <span
                  className="rolllog-pokemon"
                  style={{
                    color: rarityStyles[entry.rarity]?.color || "#fff",
                    fontWeight: 600
                  }}
                >
                  {entry.name}
                </span>
                {entry.rarity && (
                  <span className="rolllog-rarity" style={{ color: rarityStyles[entry.rarity]?.color || "#fff" }}>
                    {" "}
                    ({entry.rarity.charAt(0).toUpperCase() + entry.rarity.slice(1)})
                  </span>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}