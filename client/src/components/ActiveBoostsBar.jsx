import React, { useEffect, useState } from "react";
import "../styles/boosts.css";

/**
 * Props:
 * - boosts: Array of active boost objects, e.g.
 *   [{ id, name, type, multiplier, expiresAt }]
 */
export default function ActiveBoostsBar({ boosts = [] }) {
  // Timer for countdown
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

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

// Helper to format ms to mm:ss
function formatTimeLeft(ms) {
  if (ms <= 0) return "Expired";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}