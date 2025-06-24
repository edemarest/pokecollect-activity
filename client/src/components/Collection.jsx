import React, { useState } from "react";

const sortOptions = [
  { value: "dex", label: "Dex #" },
  { value: "rarity", label: "Rarity" },
  { value: "amount", label: "Amount Owned" },
  { value: "name", label: "Name" }
];

export default function Collection({ collection, onSelect }) {
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
      width: 480,
      minWidth: 340,
      maxWidth: 520,
      height: 'calc(100vh - 180px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
      padding: 0,
      margin: 0
    }}>
      <h3 style={{ textAlign: "left", marginLeft: 4, marginBottom: 8 }}>Your Collection</h3>
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
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(4, 1fr)",
          gap: 8,
          justifyItems: "center",
          alignItems: "center"
        }}>
          {filtered.length === 0 ? (
            <div style={{ color: "#aaa", gridColumn: 'span 4' }}>No Pokémon match your filter.</div>
          ) : (
            filtered.slice(0, 16).map((poke, idx) => (
              <div
                key={poke.dexNumber}
                style={{ background: "#333", borderRadius: 8, padding: 6, textAlign: "center", cursor: "pointer", width: 90, height: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => onSelect(poke)}
              >
                <img src={poke.image} alt={poke.name} style={{ width: 44, height: 44, marginBottom: 2 }} />
                <div style={{ fontWeight: "bold", fontSize: 13 }}>{poke.name}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>x{poke.amount || 1}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
