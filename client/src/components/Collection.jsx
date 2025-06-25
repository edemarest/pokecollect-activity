import React, { useState, useEffect } from "react";
import "../styles/collection.css";

const sortOptions = [
  { value: "dex", label: "Dex #" },
  { value: "rarity", label: "Rarity" },
  { value: "amount", label: "Amount Owned" },
  { value: "name", label: "Name" }
];

export default function Collection({ collection, onSelect, selectedPokemon }) {
  const [sortBy, setSortBy] = useState("dex");
  const [filter, setFilter] = useState("");
  const [rarityStyles, setRarityStyles] = useState({});

  useEffect(() => {
    fetch("/data/rarityStyles.json")
      .then(res => res.json())
      .then(setRarityStyles)
      .catch(() => setRarityStyles({}));
  }, []);

  function getRarityRank(rarity) {
    const order = ["common", "uncommon", "rare", "wild", "legendary"];
    const idx = order.indexOf(rarity);
    return idx === -1 ? 99 : idx;
  }

  let filtered = collection.filter(poke =>
    poke.name.toLowerCase().includes(filter.toLowerCase())
  );

  filtered = filtered.sort((a, b) => {
    if (sortBy === "dex") return a.dexNumber - b.dexNumber;
    if (sortBy === "rarity") return getRarityRank(a.rarity) - getRarityRank(b.rarity);
    if (sortBy === "amount") return (b.amount || 1) - (a.amount || 1);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="collection-root">
      <div className="collection-panel">
        <div className="collection-controls">
          <input
            type="text"
            placeholder="Filter by name..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="collection-filter-input"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="collection-sort-select"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="collection-grid">
          {filtered.length === 0 ? (
            <div className="collection-empty">No Pokémon match your filter.</div>
          ) : (
            filtered.map((poke, idx) => {
              const rarityStyle = rarityStyles[poke.rarity] || { color: '#fff', gradient: 'none' };
              return (
                <div
                  key={poke.dexNumber}
                  className={
                    "collection-card" +
                    (selectedPokemon && selectedPokemon.dexNumber === poke.dexNumber ? " selected" : "")
                  }
                  onClick={() => onSelect(poke)}
                >
                  <img
                    src={poke.image.startsWith('/') ? poke.image : '/' + poke.image}
                    alt={poke.name}
                    className="collection-img"
                  />
                  <div className="collection-name">{poke.name}</div>
                  <div className="collection-rarity" style={{ color: rarityStyle.color }}>
                    {poke.rarity.charAt(0).toUpperCase() + poke.rarity.slice(1)}
                  </div>
                  <div className="collection-amount">x{poke.amount || 1}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
