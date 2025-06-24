import React, { useState } from "react";

export default function PokemonDetailModal({ pokemon, onClose, onSell, onSetAvatar, isAvatar }) {
  const [sellAmount, setSellAmount] = useState(1);
  if (!pokemon) return null;

  const maxAmount = pokemon.amount || 1;

  function handleSell() {
    if (sellAmount > 0 && sellAmount <= maxAmount) {
      onSell(sellAmount);
    }
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{ background: "#222", color: "#fff", borderRadius: 12, padding: 32, minWidth: 340, boxShadow: "0 4px 24px #0008", maxWidth: 400 }}>
        <img src={pokemon.image} alt={pokemon.name} style={{ width: 100, height: 100, marginBottom: 16 }} />
        <h2>{pokemon.name} <span style={{ fontSize: 16, color: "#aaa" }}>#{pokemon.dexNumber}</span></h2>
        <div>Rarity: {pokemon.rarity}</div>
        <div>Amount owned: {maxAmount}</div>
        <div style={{ margin: "16px 0" }}>
          <label>Sell amount: </label>
          <input
            type="number"
            min={1}
            max={maxAmount}
            value={sellAmount}
            onChange={e => setSellAmount(Math.max(1, Math.min(maxAmount, Number(e.target.value))))}
            style={{ width: 60, marginLeft: 8 }}
          />
        </div>
        <button onClick={handleSell} style={{ marginRight: 12, padding: "8px 24px", borderRadius: 8, background: "#e53935", color: "#fff", border: "none", cursor: "pointer" }}>
          Sell
        </button>
        <button onClick={onClose} style={{ marginRight: 12, padding: "8px 24px", borderRadius: 8, background: "#333", color: "#fff", border: "none", cursor: "pointer" }}>
          Close
        </button>
        <button onClick={onSetAvatar} disabled={isAvatar} style={{ padding: "8px 24px", borderRadius: 8, background: isAvatar ? "#888" : "#4caf50", color: "#fff", border: "none", cursor: isAvatar ? "not-allowed" : "pointer", marginTop: 12 }}>
          {isAvatar ? "Avatar" : "Set as Avatar"}
        </button>
      </div>
    </div>
  );
}
