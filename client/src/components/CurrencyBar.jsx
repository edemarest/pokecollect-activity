import React from "react";
import "../styles/top-bar.css";

// CurrencyBar displays the user's power and rubies
export default function CurrencyBar({ power = 0, rubies = 0 }) {
  return (
    <div className="currency-bar">
      <div className="currency-bar-item power">
        <span role="img" aria-label="Power" className="currency-bar-icon">⚡</span>
        <b>{power}</b>
      </div>
      <div className="currency-bar-item rubies">
        <span role="img" aria-label="Rubies" className="currency-bar-icon">💎</span>
        <b>{rubies}</b>
      </div>
    </div>
  );
}
