import React from "react";

export default function RollScreen({ onRoll, rolledPokemon, onClaim, onDiscard, isSaving }) {
    return (
        <div style={{ margin: "32px 0" }}>
            <div style={{ marginTop: 32 }}>
                {rolledPokemon ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <img src={rolledPokemon.image} alt={rolledPokemon.name} style={{ width: 80, height: 80, marginBottom: 8 }} />
                        <div><b>{rolledPokemon.name}</b> (#{rolledPokemon.dexNumber})</div>
                        <div>Rarity: {rolledPokemon.rarity}</div>
                        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                            <button onClick={onClaim} disabled={isSaving} style={{ padding: "8px 24px", borderRadius: 8, background: isSaving ? "#888" : "#2196f3", color: "#fff", border: "none", cursor: isSaving ? "not-allowed" : "pointer" }}>
                                Claim
                            </button>
                            <button onClick={onDiscard} disabled={isSaving} style={{ padding: "8px 24px", borderRadius: 8, background: isSaving ? "#888" : "#e53935", color: "#fff", border: "none", cursor: isSaving ? "not-allowed" : "pointer" }}>
                                Discard
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                marginBottom: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f0f0f0",
                                borderRadius: 8,
                                fontSize: 48,
                                color: "#bbb",
                                border: "2px dashed #ccc"
                            }}
                        >
                            ?
                        </div>
                    </div>
                )}
            </div>
            <button
                onClick={onRoll}
                disabled={!!rolledPokemon || isSaving}
                style={{
                    fontSize: 24,
                    padding: "12px 32px",
                    borderRadius: 8,
                    background: isSaving ? "#888" : "#4caf50",
                    color: "#fff",
                    border: "none",
                    cursor: !!rolledPokemon || isSaving ? "not-allowed" : "pointer",
                    opacity: !!rolledPokemon || isSaving ? 0.6 : 1,
                    marginTop: 32,
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto"
                }}
            >
                Roll
            </button>
        </div>
    );
}
