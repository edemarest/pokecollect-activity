import React, { useState, useEffect } from "react";
import CurrencyBar from "./components/CurrencyBar";
import RollScreen from "./components/RollScreen";
import Collection from "./components/Collection";
import PokemonDetailModal from "./components/PokemonDetailModal";
import Leaderboard from "./components/Leaderboard";
import { getPlayerState, setPlayerState } from "./utils/api";
// Temporary: import Pokémon data for local testing
import pokemonData from "../data/pokemon.json";

export default function App() {
  // State for rolled Pokémon, collection, power, rubies, avatar
  const [rolledPokemon, setRolledPokemon] = useState(null);
  const [collection, setCollection] = useState([]);
  const [power, setPower] = useState(0);
  const [rubies, setRubies] = useState(0);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [avatarDexNumber, setAvatarDexNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [discordUsername, setDiscordUsername] = useState(null);

  // Get Discord user info via Activity SDK
  useEffect(() => {
    async function getDiscordUser() {
      console.log("[DiscordUser] Checking for Discord SDK...");
      // TEMP: Force fallback for Discord testing
      setUserId("user1");
      setDiscordUsername("YourDiscord#1234");
      return;
      // --- Remove the above lines to restore Discord SDK logic ---
      // Check if running in Discord Activity
      if (window.DiscordNative && window.DiscordNative.activity) {
        window.DiscordNative.activity.getCurrentUser((user) => {
          console.log("[DiscordUser] DiscordNative.activity.getCurrentUser", user);
          if (user && user.id) {
            setUserId(user.id);
            setDiscordUsername(user.username + (user.discriminator ? `#${user.discriminator}` : ""));
          } else {
            setError("Could not get Discord user info. Please relaunch the Activity.");
          }
        });
      } else if (window.DiscordActivity && window.DiscordActivity.getCurrentUser) {
        // Some SDKs use DiscordActivity
        window.DiscordActivity.getCurrentUser().then(user => {
          console.log("[DiscordUser] DiscordActivity.getCurrentUser", user);
          if (user && user.id) {
            setUserId(user.id);
            setDiscordUsername(user.username + (user.discriminator ? `#${user.discriminator}` : ""));
          } else {
            setError("Could not get Discord user info. Please relaunch the Activity.");
          }
        }).catch((e) => {
          console.error("[DiscordUser] DiscordActivity.getCurrentUser error", e);
          setError("Could not get Discord user info. Please relaunch the Activity.");
        });
      } else {
        // Fallback: running in browser for dev
        setUserId("user1");
        setDiscordUsername("YourDiscord#1234");
      }
    }
    getDiscordUser();
  }, []);

  // Load state from backend when userId is available
  useEffect(() => {
    if (!userId) return;
    async function fetchState() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPlayerState(userId);
        console.log("Fetched player state:", data);
        setCollection(data.collection || []);
        setRubies(data.rubies || 0);
        setAvatarDexNumber(data.avatarDexNumber || null);
      } catch (err) {
        console.error("Failed to load player data:", err);
        setError("Failed to load player data.");
      } finally {
        setLoading(false);
      }
    }
    fetchState();
  }, [userId]);

  // Debounced save to backend whenever collection, rubies, or avatar changes
  useEffect(() => {
    if (loading || !userId) return; // Don't save while loading or missing user
    const timeout = setTimeout(() => {
      setPlayerState(userId, { collection, rubies, avatarDexNumber }).catch(() => {
        setError("Failed to save player data.");
      });
    }, 400); // 400ms debounce
    return () => clearTimeout(timeout);
  }, [collection, rubies, avatarDexNumber, loading, userId]);

  // Simulate a roll (randomly pick from data)
  function handleRoll() {
    const idx = Math.floor(Math.random() * pokemonData.length);
    setRolledPokemon(pokemonData[idx]);
  }

  // Claim the rolled Pokémon
  function handleClaim() {
    if (!rolledPokemon) return;
    setCollection((prev) => {
      const idx = prev.findIndex((p) => p.dexNumber === rolledPokemon.dexNumber);
      let updated;
      if (idx !== -1) {
        // Already owned, increment amount
        updated = [...prev];
        updated[idx] = { ...updated[idx], amount: (updated[idx].amount || 1) + 1 };
      } else {
        // New Pokémon
        updated = [...prev, { ...rolledPokemon, amount: 1 }];
      }
      // If no avatar set, set to first Pokémon caught
      if (!avatarDexNumber) {
        setAvatarDexNumber(rolledPokemon.dexNumber);
      }
      return updated;
    });
    setRolledPokemon(null);
  }

  // Discard the rolled Pokémon
  function handleDiscard() {
    setRolledPokemon(null);
  }

  // Sell Pokémon from modal
  function handleSell(amount) {
    setCollection((prev) => {
      const idx = prev.findIndex((p) => p.dexNumber === selectedPokemon.dexNumber);
      if (idx === -1) return prev;
      const updated = [...prev];
      const newAmount = (updated[idx].amount || 1) - amount;
      if (newAmount > 0) {
        updated[idx] = { ...updated[idx], amount: newAmount };
      } else {
        updated.splice(idx, 1);
        // If avatar was this Pokémon, reset avatar to another or null
        if (avatarDexNumber === selectedPokemon.dexNumber) {
          setAvatarDexNumber(updated.length > 0 ? updated[0].dexNumber : null);
        }
      }
      return updated;
    });
    setRubies((r) => r + amount * (selectedPokemon.power || 0));
    setSelectedPokemon(null);
  }

  // Set avatar from modal
  function handleSetAvatar() {
    if (selectedPokemon) {
      setAvatarDexNumber(selectedPokemon.dexNumber);
    }
  }

  // Recalculate power whenever collection changes
  useEffect(() => {
    setPower(collection.reduce((sum, p) => sum + (p.power * (p.amount || 1)), 0));
  }, [collection]);

  // Get avatar Pokémon object
  const avatar = collection.find(p => p.dexNumber === avatarDexNumber);

  console.log("Render", { error, loading, userId, discordUsername, collection, avatar });

  if (error) {
    return <div style={{ color: 'red', padding: 40 }}>{error}</div>;
  }
  if (loading || !userId || !discordUsername) {
    return <div style={{ color: '#fff', padding: 40 }}>Loading player data...</div>;
  }
  if (collection.length === 0) {
    return <div style={{ color: '#fff', padding: 40 }}>No Pokémon in your collection yet. Try rolling to get started!</div>;
  }

  return (
    <div style={{
      background: "#222",
      minHeight: "100vh",
      color: "#fff",
      paddingTop: 40,
      maxWidth: 1800,
      margin: "0 auto",
      display: "flex",
      flexDirection: "row"
    }}>
      {/* Left sidebar for avatar and user info */}
      <div style={{ width: 520, minWidth: 340, padding: 24, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {avatar ? (
          <div style={{ marginBottom: 18, display: "flex", alignItems: "center" }}>
            <img src={avatar.image} alt={avatar.name} style={{ width: 54, height: 54, borderRadius: 12, border: "3px solid #4caf50", marginRight: 10 }} />
            <div>
              <div style={{ fontWeight: "bold", fontSize: 17 }}>{avatar.name}</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>Avatar</div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 18, color: "#aaa" }}>No avatar set</div>
        )}
        <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 8 }}>@{discordUsername}</div>
        <CurrencyBar power={power} rubies={rubies} />
        <Collection collection={collection} onSelect={setSelectedPokemon} />
        <Leaderboard playerUserId={userId} collection={collection} />
      </div>
      {/* Main content area: RollScreen */}
      <div style={{ flex: 1, padding: 32, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
        <h2 style={{ textAlign: "left", marginLeft: 8, alignSelf: 'flex-start' }}>Pokémon RNG Activity</h2>
        <RollScreen onRoll={handleRoll} rolledPokemon={rolledPokemon} onClaim={handleClaim} onDiscard={handleDiscard} />
        {selectedPokemon && (
          <PokemonDetailModal
            pokemon={selectedPokemon}
            onClose={() => setSelectedPokemon(null)}
            onSell={handleSell}
            onSetAvatar={handleSetAvatar}
            isAvatar={avatarDexNumber === selectedPokemon.dexNumber}
          />
        )}
      </div>
    </div>
  );
}