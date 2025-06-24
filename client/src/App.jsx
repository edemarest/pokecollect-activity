import React, { useState, useEffect } from "react";
import CurrencyBar from "./components/CurrencyBar";
import RollScreen from "./components/RollScreen";
import Collection from "./components/Collection";
import PokemonInfoPanel from "./components/PokemonInfoPanel";
import Leaderboard from "./components/Leaderboard";
import { getPlayerState, setPlayerState, patchPlayerState } from "./utils/api";
import pokemonData from "../data/pokemon.json";
import './App.css';
import './AppLayout.css';

export default function App({ discordSdk, auth }) {
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
  const [isSaving, setIsSaving] = useState(false);
  // Add sidebar state for toggles
  const [sidebarTab, setSidebarTab] = useState('collection'); // 'collection' or 'shop'
  const [collectionOpen, setCollectionOpen] = useState(true); // open by default

  // Get Discord user info via Activity SDK
  useEffect(() => {
    if (auth && auth.user) {
      setUserId(auth.user.id);
      setDiscordUsername(auth.user.username + (auth.user.discriminator ? `#${auth.user.discriminator}` : ""));
      return;
    }
    async function getDiscordUser() {
      console.log("[DiscordUser] Checking for Discord SDK...");
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
        setError("Discord SDK not detected. Using fallback user. If you are in Discord, make sure the Activity SDK is available.");
      }
    }
    getDiscordUser();
  }, [auth]);

  // Load state from backend when userId is available
  useEffect(() => {
    if (!userId) return;
    async function fetchState() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPlayerState(userId);
        console.log("Fetched player state:", data);
        setCollection(Array.isArray(data.collection) ? data.collection : []);
        setRubies(typeof data.rubies === 'number' ? data.rubies : 0);
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

  // Simulate a roll (randomly pick from data)
  function handleRoll() {
    const idx = Math.floor(Math.random() * pokemonData.length);
    setRolledPokemon(pokemonData[idx]);
  }

  // Claim the rolled Pokémon
  async function handleClaim() {
    if (!rolledPokemon || isSaving) return;
    setIsSaving(true);
    let updatedCollection;
    setCollection((prev) => {
      const idx = prev.findIndex((p) => p.dexNumber === rolledPokemon.dexNumber);
      let updated;
      if (idx !== -1) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], amount: (updated[idx].amount || 1) + 1 };
      } else {
        updated = [...prev, { ...rolledPokemon, amount: 1 }];
      }
      if (!avatarDexNumber) {
        setAvatarDexNumber(rolledPokemon.dexNumber);
      }
      updatedCollection = updated;
      return updated;
    });
    setRolledPokemon(null);
    if (userId) {
      try {
        await patchPlayerState(userId, { collection: updatedCollection });
      } catch (e) {
        setError("Failed to update collection on server.");
      }
    }
    setIsSaving(false);
  }

  // Discard the rolled Pokémon
  async function handleDiscard() {
    setRolledPokemon(null);
    // No backend update needed for discard, as nothing changes
  }

  // Set avatar from modal
  async function handleSetAvatar() {
    if (!selectedPokemon || !userId || isSaving) return;
    setIsSaving(true);
    setAvatarDexNumber(selectedPokemon.dexNumber);
    try {
      await patchPlayerState(userId, {
        avatarDexNumber: selectedPokemon.dexNumber,
        avatarImage: selectedPokemon.image // Save image path as well
      });
    } catch (e) {
      setError("Failed to update avatar on server.");
    }
    setIsSaving(false);
  }

  // Sell Pokémon from modal
  async function handleSell(amount) {
    if (isSaving) return;
    setIsSaving(true);
    setCollection((prev) => {
      const idx = prev.findIndex((p) => p.dexNumber === selectedPokemon.dexNumber);
      if (idx === -1) return prev;
      const updated = [...prev];
      const newAmount = (updated[idx].amount || 1) - amount;
      if (newAmount > 0) {
        updated[idx] = { ...updated[idx], amount: newAmount };
      } else {
        updated.splice(idx, 1);
        if (avatarDexNumber === selectedPokemon.dexNumber) {
          const newAvatar = updated.length > 0 ? updated[0].dexNumber : null;
          setAvatarDexNumber(newAvatar);
          if (userId) patchPlayerState(userId, { avatarDexNumber: newAvatar });
        }
      }
      return updated;
    });
    setRubies((r) => r + amount * (selectedPokemon.power || 0));
    if (userId) patchPlayerState(userId, { rubies: rubies + amount * (selectedPokemon.power || 0) });
    setSelectedPokemon(null);
    setIsSaving(false);
  }

  // Recalculate power whenever collection changes
  useEffect(() => {
    setPower(collection.reduce((sum, p) => sum + (p.power * (p.amount || 1)), 0));
  }, [collection]);

  // Get avatar Pokémon object
  const avatar = collection.find(p => p.dexNumber === avatarDexNumber);

  // Show error messages temporarily (auto-clear after 3 seconds)
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  console.log("Render", { error, loading, userId, discordUsername, collection, avatar });

  if (error) {
    return <div style={{ color: 'red', padding: 40 }}>{error}</div>;
  }
  if (loading || !userId || !discordUsername) {
    return <div style={{ color: '#fff', padding: 40 }}>Loading player data...</div>;
  }

  return (
    <div className="app-root">
      {/* Top bar for power/rubies */}
      <div className="topbar">
        <CurrencyBar power={power} rubies={rubies} />
      </div>
      <div className="layout-row">
        {/* Sidebar content (Collection or Shop) */}
        <div className={`collection-sidebar${collectionOpen ? ' open' : ''}`}>
          {/* Sidebar toggles attached to right edge of sidebar, always visible */}
          {collectionOpen && (
            <>
              <div className="collection-header">
                {/* Menu toggles above the title and content */}
                <div className="sidebar-menu-toggles sidebar-menu-toggles--block">
                  <button
                    className={`sidebar-menu-btn${sidebarTab === 'collection' ? ' active' : ''}`}
                    onClick={() => setSidebarTab('collection')}
                    aria-label="Show Collection"
                  >
                    <span role="img" aria-label="Collection" style={{fontSize: 20}}>📦</span>
                  </button>
                  <button
                    className={`sidebar-menu-btn${sidebarTab === 'shop' ? ' active' : ''}`}
                    onClick={() => setSidebarTab('shop')}
                    aria-label="Show Shop"
                  >
                    <span role="img" aria-label="Shop" style={{fontSize: 20}}>🛒</span>
                  </button>
                </div>
                <span className="collection-header-title" style={{ fontWeight: 'bold', fontSize: 22, marginRight: 12 }}>
                  {sidebarTab === 'collection' ? 'Your Collection' : 'Shop'}
                </span>
              </div>
              <div className="collection-content">
                {sidebarTab === 'collection' ? (
                  <div className="collection-grid">
                    <Collection collection={collection} onSelect={setSelectedPokemon} selectedPokemon={selectedPokemon} />
                  </div>
                ) : (
                  <div className="shop-placeholder">
                    <h2>Shop Coming Soon</h2>
                    <p>Placeholder for shop UI.</p>
                  </div>
                )}
              </div>
              {/* Condensed Pokémon info panel at bottom of sidebar */}
              {sidebarTab === 'collection' && selectedPokemon && (
                <PokemonInfoPanel
                  pokemon={selectedPokemon}
                  onClose={() => setSelectedPokemon(null)}
                  onSell={handleSell}
                  onSetAvatar={handleSetAvatar}
                  isAvatar={avatarDexNumber === selectedPokemon.dexNumber}
                  isSaving={isSaving}
                />
              )}
            </>
          )}
        </div>
        {/* Main Roll UI Centered */}
        <div className="center-main">
          <RollScreen onRoll={handleRoll} rolledPokemon={rolledPokemon} onClaim={handleClaim} onDiscard={handleDiscard} isSaving={isSaving} />
        </div>
        {/* Leaderboard Sidebar */}
        <div className="leaderboard-sidebar">
          <Leaderboard playerUserId={userId} collection={collection} showAvatars usernamesMap={{ [userId]: discordUsername }} />
        </div>
      </div>
    </div>
  );
}