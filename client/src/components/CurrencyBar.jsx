import React from "react";

export default function CurrencyBar({ power = 0, rubies = 0 }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 18, margin: "0 0 12px 0" }}>
      <div style={{ background: "#333", padding: "4px 14px", borderRadius: 8, fontSize: 15, display: 'flex', alignItems: 'center' }}>
        <span role="img" aria-label="Power" style={{ marginRight: 4 }}>⚡</span> <b>{power}</b>
      </div>
      <div style={{ background: "#333", padding: "4px 14px", borderRadius: 8, fontSize: 15, display: 'flex', alignItems: 'center' }}>
        <span role="img" aria-label="Rubies" style={{ marginRight: 4 }}>💎</span> <b>{rubies}</b>
      </div>
    </div>
  );
}
