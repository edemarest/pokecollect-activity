import React, { useState } from "react";

// Rarity color and gradient map
export const RARITY_STYLES = {
  common: {
    color: '#bdbdbd',
    gradient: 'linear-gradient(90deg, #e0e0e0 0%, #bdbdbd 50%, #e0e0e0 100%)'
  },
  uncommon: {
    color: '#4caf50',
    gradient: 'linear-gradient(90deg, #a8ff78 0%, #4caf50 50%, #a8ff78 100%)'
  },
  rare: {
    color: '#2196f3',
    gradient: 'linear-gradient(90deg, #6dd5fa 0%, #2196f3 50%, #6dd5fa 100%)'
  },
  wild: {
    color: '#ab47bc',
    gradient: 'linear-gradient(90deg, #f3e7e9 0%, #ab47bc 50%, #f3e7e9 100%)'
  },
  legendary: {
    color: '#ffd700',
    gradient: 'linear-gradient(90deg, #fffbe6 0%, #ffd700 40%, #fffbe6 100%)'
  }
};

const sortOptions = [
  { value: "dex", label: "Dex #" },
  { value: "rarity", label: "Rarity" },
  { value: "amount", label: "Amount Owned" },
  { value: "name", label: "Name" }
];

export default function Collection({ collection, onSelect, selectedPokemon }) {
  const [sortBy, setSortBy] = useState("dex");
  const [filter, setFilter] = useState("");

  function getRarityRank(rarity) {
    // Lower is more common
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
    <div style={{
      width: '100%',
      minWidth: 0,
      maxWidth: '100%',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
      padding: 0,
      margin: 0
    }}>
      <div style={{
        background: '#181818',
        borderRadius: 12,
        boxShadow: '0 2px 12px #0006',
        padding: 16,
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Filter by name..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: 6, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff", minWidth: 120 }}
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: 6, borderRadius: 6, border: "1px solid #444", background: "#222", color: "#fff" }}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          justifyItems: "center",
          alignItems: "center"
        }}>
          {filtered.length === 0 ? (
            <div style={{ color: "#aaa", gridColumn: 'span 3' }}>No Pokémon match your filter.</div>
          ) : (
            filtered.map((poke, idx) => {
              const rarityStyle = RARITY_STYLES[poke.rarity] || { color: '#fff', gradient: 'none' };
              return (
                <div
                  key={poke.dexNumber}
                  className={
                    "collection-card" +
                    (selectedPokemon && selectedPokemon.dexNumber === poke.dexNumber ? " selected" : "")
                  }
                  style={{
                    background: "#333",
                    borderRadius: 8,
                    padding: 6,
                    textAlign: "center",
                    cursor: "pointer",
                    width: 90,
                    height: 90,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => onSelect(poke)}
                >
                  <img src={poke.image} alt={poke.name} style={{ width: 44, height: 44, marginBottom: 2 }} />
                  <div style={{ fontWeight: "bold", fontSize: 13 }}>{poke.name}</div>
                  <div style={{ fontSize: 11, color: rarityStyle.color }}>{poke.rarity.charAt(0).toUpperCase() + poke.rarity.slice(1)}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>x{poke.amount || 1}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
