import React, { useState, useEffect } from "react";

// PokemonInfoPanel displays details and actions for a selected Pokémon
export default function PokemonInfoPanel({ pokemon, onSell, onSetAvatar, isAvatar, isSaving }) {
  // --- State ---
  const [sellAmount, setSellAmount] = useState(1);
  const [rarityStyles, setRarityStyles] = useState({});

  // --- Effect: Fetch rarity styles ---
  useEffect(() => {
    fetch("/data/rarityStyles.json")
      .then(res => res.json())
      .then(setRarityStyles)
      .catch(() => setRarityStyles({}));
  }, []);

  if (!pokemon) return null;

  // --- Helpers ---
  const maxAmount = pokemon.amount || 1;
  const rarityStyle = rarityStyles[pokemon.rarity] || { color: '#fff', gradient: 'none' };

  // --- Handlers ---
  function handleSell() {
    if (sellAmount > 0 && sellAmount <= maxAmount) {
      onSell(sellAmount);
    }
  }

  // --- Render ---
  return (
    <div className="pokemon-info-panel">
      <div className="pokemon-info-panel-content">
        <div className="pokemon-info-main">
          <img
            src={pokemon.image.startsWith('/') ? pokemon.image : '/' + pokemon.image}
            alt={pokemon.name}
            className="pokemon-info-img"
          />
          <div className="pokemon-info-details">
            <div className="pokemon-info-title selected-indicator">
              {pokemon.name} <span className="pokemon-info-dex">#{pokemon.dexNumber}</span>
              <span className="selected-dot" title="Selected">●</span>
            </div>
            <div
              className="pokemon-info-rarity"
              style={{
                color: rarityStyle.color,
                fontWeight: 600
              }}
            >
              {pokemon.rarity.charAt(0).toUpperCase() + pokemon.rarity.slice(1)}
            </div>
            <div className="pokemon-info-amount">Amount: {maxAmount}</div>
          </div>
        </div>
        <div className="pokemon-info-actions">
          <label>Sell:
            <input
              type="number"
              min={1}
              max={maxAmount}
              value={sellAmount}
              onChange={e => setSellAmount(Math.max(1, Math.min(maxAmount, Number(e.target.value))))}
              disabled={isSaving}
              className="pokemon-info-sell-input"
            />
          </label>
          <button onClick={handleSell} disabled={isSaving} className="pokemon-info-sell-btn">Sell</button>
          <button onClick={onSetAvatar} disabled={isAvatar || isSaving} className="pokemon-info-avatar-btn">
            {isAvatar ? "Avatar" : "Set as Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
}
