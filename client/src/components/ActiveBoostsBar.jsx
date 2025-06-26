import React, { useEffect, useState } from "react";
import "../styles/boosts.css";

// ActiveBoostsBar displays currently active boosts and their timers
export default function ActiveBoostsBar({ boosts = [] }) {
  // --- State: Used to trigger re-render for countdown timers ---
  const [, setNow] = useState(Date.now());

  // --- Effect: Update every second to refresh timers ---
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // --- Render: Boost cards or empty bar ---
  return (
    <div className="active-boosts-bar">
      {boosts.length === 0 ? (
        // Empty bar to reserve space
        <div style={{ minHeight: 0, minWidth: 0 }} />
      ) : (
        boosts.map(boost => (
          <div className="boost-card" key={boost.id}>
            <div className="boost-name">{boost.name}</div>
            <div className="boost-effect">
              {boost.type === "luck" && `Luck x${boost.multiplier}`}
              {boost.type === "speed" && `Roll Speed x${boost.multiplier}`}
              {boost.type === "auto" && "Auto-Roll"}
            </div>
            <div className="boost-timer">
              {boost.expiresAt
                ? formatTimeLeft(boost.expiresAt - Date.now())
                : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Helper: Format ms to mm:ss or Expired
function formatTimeLeft(ms) {
  if (ms <= 0) return "Expired";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}