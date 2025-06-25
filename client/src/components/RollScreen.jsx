import React, { useState, useRef, useEffect } from "react";
import "../styles/roll.css";

export default function RollScreen({ onRoll, rolledPokemon, onClaim, onDiscard, isSaving, pokemonList }) {
    const [rarityStyles, setRarityStyles] = useState({});
    useEffect(() => {
      fetch("/data/rarityStyles.json")
        .then(res => res.json())
        .then(setRarityStyles)
        .catch(() => setRarityStyles({}));
    }, []);

    const [isRolling, setIsRolling] = useState(false);
    const [flashPokemon, setFlashPokemon] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [settling, setSettling] = useState(false);
    const [settled, setSettled] = useState(false);

    function getRandomPokemon() {
        return pokemonList[Math.floor(Math.random() * pokemonList.length)];
    }

    async function handleRollAnimation() {
        setIsRolling(true);
        setExpanded(false);
        setSettling(false);
        setSettled(false);
        let flashes = 32;
        let delay = 40;
        let current = null;

        for (let i = 0; i < flashes; i++) {
            current = getRandomPokemon();
            setFlashPokemon(current);
            await new Promise(res => setTimeout(res, delay));
            delay = Math.min(delay * 1.13, 300);
        }
        setFlashPokemon(null);
        setIsRolling(false);
        setExpanded(true);
        onRoll();
        // After expansion, go to settling, then settled
        setTimeout(() => {
            setSettling(true);
            setExpanded(false);
            setTimeout(() => {
                setSettling(false);
                setSettled(true);
            }, 700); // match .settling transition duration
        }, 250); // short pop before settling
    }

    function handleRollClick() {
        if (isRolling || isSaving) return;
        handleRollAnimation();
    }

    // Listen for Enter key to claim
    useEffect(() => {
        if (rolledPokemon && settled && !isSaving) {
            const handleKeyDown = (e) => {
                if (e.key === "Enter") {
                    onClaim();
                }
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [rolledPokemon, settled, isSaving, onClaim]);

    let displayPokemon = flashPokemon || rolledPokemon;
    let imgClass = "rollscreen-pokemon-img";
    if (rolledPokemon && !flashPokemon) {
        if (expanded) imgClass += " expanded";
        else if (settling) imgClass += " settling";
        else if (settled) imgClass += " settled";
    }

    return (
        <div className="rollscreen-root">
            <div className="rollscreen-content">
                {displayPokemon ? (
                    <div className="rollscreen-anim-container">
                        <img
                            src={displayPokemon.image}
                            alt={displayPokemon.name}
                            className={imgClass}
                        />
                        <div className="rollscreen-pokemon-name">
                            <b>{displayPokemon.name}</b> (#{displayPokemon.dexNumber})
                        </div>
                        <div
                            className="rollscreen-pokemon-rarity"
                            style={{
                                color: rarityStyles[displayPokemon.rarity]?.color || "#fff"
                            }}
                        >
                            Rarity: {displayPokemon.rarity}
                        </div>
                        {rolledPokemon && !flashPokemon && settled && (
                            <div className="rollscreen-actions">
                                <button
                                    onClick={onClaim}
                                    disabled={isSaving}
                                    className="rollscreen-btn claim"
                                >
                                    Claim
                                </button>
                                <button
                                    onClick={onDiscard}
                                    disabled={isSaving}
                                    className="rollscreen-btn discard"
                                >
                                    Discard
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rollscreen-anim-container">
                        <div className="rollscreen-placeholder">?</div>
                    </div>
                )}
            </div>
            {/* Only show Roll button if there is no rolledPokemon */}
            {!rolledPokemon && (
                <button
                    onClick={handleRollClick}
                    disabled={isRolling || isSaving}
                    className="rollscreen-roll-btn"
                >
                    {isRolling ? "Rolling..." : "Roll"}
                </button>
            )}
        </div>
    );
}
