import React, { useState, useEffect } from "react";
import CurrencyBar from "./components/CurrencyBar";
import RollScreen from "./components/RollScreen";
import Collection from "./components/Collection";
import PokemonInfoPanel from "./components/PokemonInfoPanel";
import Leaderboard from "./components/Leaderboard";
import Shop from "./components/Shop";
import ShopInfoPanel from "./components/ShopInfoPanel";
import { getPlayerState, setPlayerState, patchPlayerState, claimPokemon as claimPokemonApi, discardPokemon as discardPokemonApi, setAvatar as setAvatarApi, sellPokemon as sellPokemonApi } from "./utils/api";
import { weightedRandomPokemon } from "../utils/gameLogic";
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
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);
  const [rollLog, setRollLog] = useState([]);
  const [pokemonData, setPokemonData] = useState([]);
  const [selectedBoost, setSelectedBoost] = useState(null);

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

  // Fetch Pokémon data
  useEffect(() => {
    fetch("/data/pokemon.json")
      .then(res => res.json())
      .then(setPokemonData);
  }, []);

  // Simulate a roll (randomly pick from data)
  async function handleRoll() {
    if (rolledPokemon || isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/roll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setRolledPokemon(data.pokemon);
    } catch (e) {
      // handle error
    }
    setIsSaving(false);
  }

  // Claim the rolled Pokémon
  async function handleClaim() {
    if (!rolledPokemon || isSaving) return;
    setIsSaving(true);
    try {
      if (userId) {
        const result = await claimPokemonApi(userId, rolledPokemon);
        setCollection(result.collection);
        // Add:
        setLeaderboardRefreshKey(k => k + 1);
      }
      setRolledPokemon(null);
    } catch (e) {
      setError("Failed to claim Pokémon on server.");
    }
    setIsSaving(false);
  }

  // Discard the rolled Pokémon
  async function handleDiscard() {
    if (!rolledPokemon || isSaving) return;
    setIsSaving(true);
    try {
      if (userId) {
        const result = await discardPokemonApi(userId, rolledPokemon.dexNumber, 1);
        setCollection(result.collection);
        console.log("[App] Discarded Pokémon successfully:", rolledPokemon.name);
      }
      setRolledPokemon(null);
    } catch (e) {
      setError("Failed to discard Pokémon on server.");
    }
    setIsSaving(false);
  }

  // Set avatar from modal
  async function handleSetAvatar() {
    if (!selectedPokemon || !userId || isSaving) return;
    setIsSaving(true);
    try {
      const result = await setAvatarApi(userId, selectedPokemon.dexNumber, selectedPokemon.image);
      setAvatarDexNumber(result.avatarDexNumber);
      console.log("[App] Set avatar successfully:", selectedPokemon.name);
    } catch (e) {
      setError("Failed to update avatar on server.");
    }
    setIsSaving(false);
  }

  // Sell Pokémon from modal
  async function handleSell(amount) {
    if (isSaving || !selectedPokemon || !userId) return;
    setIsSaving(true);
    try {
      const result = await sellPokemonApi(userId, selectedPokemon.dexNumber, amount);
      setCollection(result.collection);
      setRubies(result.rubies);
      console.log("[App] Sold Pokémon successfully:", selectedPokemon.name, "amount:", amount);
      setSelectedPokemon(null);
    } catch (e) {
      setError("Failed to sell Pokémon on server.");
    }
    setIsSaving(false);
  }

  // Handle buying a boost
  async function handleBuyBoost(boost, quantity) {
    if (isSaving || !userId) return;
    setIsSaving(true);
    try {
      const result = await fetch("/api/player/" + userId + "/buy-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boostId: boost.id, quantity }),
      });
      const data = await result.json();
      if (data.success) {
        setRubies(data.rubies);
        // Optionally update active boosts here
      } else {
        setError("Failed to buy boost: " + (data.message || "Unknown error"));
      }
    } catch (e) {
      setError("Error buying boost: " + e.message);
    }
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

  // WebSocket effect for real-time roll log
  useEffect(() => {
    // Connect to WebSocket server
    let wsUrl;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      wsUrl = "ws://localhost:8080";
    } else {
      wsUrl = "wss://" + window.location.host;
    }
    const ws = new window.WebSocket(wsUrl);

    ws.onopen = () => {
      // Optionally, fetch initial log from REST API
      fetch("/api/roll/log")
        .then(res => res.json())
        .then(data => setRollLog(data.log || []));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "roll-log" && msg.data) {
          setRollLog(prev =>
            [...prev.slice(-19), msg.data] // keep last 20
          );
        }
      } catch (e) {
        // Ignore malformed messages
      }
    };

    ws.onerror = (e) => {
      // Optionally handle errors
      console.error("WebSocket error:", e);
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    setRollLog([{ username: "TestUser", name: "Mew", rarity: "legendary", timestamp: Date.now() }]);
  }, []);

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
                  <Shop
                    userId={userId}
                    rubies={rubies}
                    onBuyBoost={handleBuyBoost}
                    selectedBoost={selectedBoost}
                    setSelectedBoost={setSelectedBoost}
                  />
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
          <RollScreen
            onRoll={handleRoll}
            rolledPokemon={rolledPokemon}
            onClaim={handleClaim}
            onDiscard={handleDiscard}
            isSaving={isSaving}
            pokemonList={pokemonData}
          />
        </div>
        {/* Leaderboard Sidebar */}
        <div className="leaderboard-sidebar">
          <Leaderboard
            playerUserId={userId}
            collection={collection}
            showAvatars
            usernamesMap={{ [userId]: discordUsername }}
            refreshKey={leaderboardRefreshKey}
            rollLog={rollLog}
          />
        </div>
      </div>
      {/* Place ShopInfoPanel here, outside the sidebar */}
      {sidebarTab === "shop" && (
        <ShopInfoPanel
          boost={selectedBoost}
          rubies={rubies}
          onBuy={handleBuyBoost}
          isBuying={isSaving}
          onClose={() => setSelectedBoost(null)}
        />
      )}
    </div>
  );
}