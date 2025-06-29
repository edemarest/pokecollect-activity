import React, { useState, useEffect, useCallback } from "react";
import "../styles/roll.css";

// RollScreen handles rolling, claiming, and discarding Pokémon
export default function RollScreen({
  onRoll,
  rolledPokemon,
  onClaim,
  onDiscard,
  isSaving,
  pokemonList,
  activeBoosts = []
}) {
  // --- State ---
  const [rarityStyles, setRarityStyles] = useState({});
  const [isRolling, setIsRolling] = useState(false);
  const [flashPokemon, setFlashPokemon] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [settling, setSettling] = useState(false);
  const [settled, setSettled] = useState(false);
  const [autoRollEnabled, setAutoRollEnabled] = useState(false);
  const [readyToExpand, setReadyToExpand] = useState(false);

  // --- Effect: Fetch rarity styles ---
  useEffect(() => {
    fetch("/data/rarityStyles.json")
      .then(res => res.json())
      .then(setRarityStyles)
      .catch(() => setRarityStyles({}));
  }, []);

  // --- Effect: Update auto-roll state when boosts change ---
  useEffect(() => {
    setAutoRollEnabled(isAutoRollActive());
  }, [activeBoosts]);

  // --- Helpers ---
  function getRandomPokemon() {
    return pokemonList[Math.floor(Math.random() * pokemonList.length)];
  }
  function getSpeedMultiplier() {
    const now = Date.now();
    const speedBoosts = activeBoosts
      ? activeBoosts.filter(b => b.type === "speed" && b.expiresAt > now)
      : [];
    return speedBoosts.length > 0
      ? Math.max(...speedBoosts.map(b => b.multiplier))
      : 1;
  }
  // Memoized: Check if auto-roll is active
  const isAutoRollActive = useCallback(() => {
    const now = Date.now();
    return (
      activeBoosts &&
      activeBoosts.some(b => b.type === "auto" && b.expiresAt > now)
    );
  }, [activeBoosts]);

  // --- Handlers ---
  async function handleRollAnimation() {
    const now = () => (Date.now() / 1000).toFixed(2);

    setIsRolling(true);
    setExpanded(false);
    setSettling(false);
    setSettled(false);
    console.log(`[${now()}] --- ROLL START ---`);

    // --- Perfectly consistent flash animation duration ---
    const speedMultiplier = getSpeedMultiplier();
    const totalFlashDuration = 1200 / speedMultiplier; // ms, adjust as needed
    const flashes = 32;
    const baseDelay = totalFlashDuration / flashes;
    let current = null;
    const start = Date.now();
    let i = 0;
    while (Date.now() - start < totalFlashDuration) {
      current = getRandomPokemon();
      setFlashPokemon(current);
      await new Promise(res => setTimeout(res, baseDelay));
      i++;
    }
    // Ensure at least one flash happens
    if (i === 0) {
      setFlashPokemon(getRandomPokemon());
      await new Promise(res => setTimeout(res, baseDelay));
    }
    setFlashPokemon(null);
    // Instead of waiting for expanded, just trigger expand and continue
    setReadyToExpand(true); // Use effect will handle expanding
    await new Promise(res => setTimeout(res, 30)); // Give React a frame for expand
    console.log(`[${now()}] EXPANDED (glow/big)`);
    onRoll();

    // Short expanded phase for both manual and auto
    await new Promise(res => setTimeout(res, 250));
    setSettling(true);
    setExpanded(false);
    console.log(`[${now()}] SETTLING`);
    await new Promise(res => setTimeout(res, 700));
    setSettling(false);
    setSettled(true);
    console.log(`[${now()}] SETTLED`);

    if (autoRollEnabled && isAutoRollActive()) {
      // Pause in settled state for 2 seconds, then auto-claim
      await new Promise(res => setTimeout(res, 2000));
      console.log(`[${now()}] AUTO-CLAIM`);
      onClaim();
      await new Promise(res => setTimeout(res, 300));
      console.log(`[${now()}] --- ROLL END ---`);
    } else {
      console.log(`[${now()}] SETTLED (manual)`);
    }

    setIsRolling(false);
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

  // --- FIXED AUTO-ROLL LOOP ---
  useEffect(() => {
    let cancelled = false;

    async function autoRollLoop() {
      while (autoRollEnabled && isAutoRollActive() && !cancelled) {
        if (!isRolling && !isSaving) {
          await handleRollAnimation();
        } else {
          // Wait a bit before checking again
          await new Promise(res => setTimeout(res, 100));
        }
      }
    }

    if (autoRollEnabled && isAutoRollActive()) {
      autoRollLoop();
    }

    return () => { cancelled = true; };
  }, [autoRollEnabled, isRolling, isSaving, isAutoRollActive, activeBoosts]);
  // ^ only use state/props and memoized functions in deps

  let displayPokemon = flashPokemon || rolledPokemon;
  let imgClass = "rollscreen-pokemon-img";
  if (rolledPokemon && !flashPokemon) {
    if (expanded) imgClass += " expanded";
    else if (settling) imgClass += " settling";
    else if (settled) imgClass += " settled";
  }

  useEffect(() => {
    if (readyToExpand) {
      // Next tick, set expanded to true
      const id = setTimeout(() => {
        setExpanded(true);
        setReadyToExpand(false);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [readyToExpand]);

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
            {rolledPokemon && !flashPokemon && settled && !(
              autoRollEnabled && isAutoRollActive()
            ) && (
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
      {!isRolling && !(rolledPokemon && settled && !flashPokemon) && (
        <button
          onClick={handleRollClick}
          disabled={isRolling || isSaving}
          className="rollscreen-roll-btn"
        >
          {isRolling ? "Rolling..." : "Roll"}
        </button>
      )}
      {isAutoRollActive() && (
        <button
          className="rollscreen-autoroll-toggle"
          onClick={() => setAutoRollEnabled(e => !e)}
        >
          {autoRollEnabled ? "Pause Auto-Roll" : "Resume Auto-Roll"}
        </button>
      )}
    </div>
  );
}
