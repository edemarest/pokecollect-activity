import React from "react";

export default function AvatarPicker({ collection, avatarDexNumber, onSelect }) {
  return (
    <div style={{ margin: "24px 0" }}>
      <h3>Avatar</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {collection.length === 0 ? (
          <div style={{ color: "#aaa" }}>No Pokémon to feature yet.</div>
        ) : (
          collection.map((poke) => (
            <div
              key={poke.dexNumber}
              onClick={() => onSelect(poke.dexNumber)}
              style={{
                border: poke.dexNumber === avatarDexNumber ? "3px solid #4caf50" : "2px solid #333",
                borderRadius: 12,
                padding: 8,
                cursor: "pointer",
                background: poke.dexNumber === avatarDexNumber ? "#222" : "#333",
                boxShadow: poke.dexNumber === avatarDexNumber ? "0 0 12px #4caf50" : "none"
              }}
            >
              <img src={poke.image} alt={poke.name} style={{ width: 48, height: 48 }} />
              <div style={{ fontSize: 12, color: "#fff", marginTop: 4 }}>{poke.name}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
