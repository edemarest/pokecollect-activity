import React, { useEffect, useState } from "react";
import "./../styles/shop.css";

// Helper: Group boosts by name/category
function groupBoosts(boosts) {
  const groups = {};
  boosts.forEach(boost => {
    if (!groups[boost.name]) groups[boost.name] = [];
    groups[boost.name].push(boost);
  });
  return groups;
}

// Category label color map
const CATEGORY_COLORS = {
  "Double Luck": "#ffd54f",
  "Ultra Luck": "#90caf9",
  "Double Roll Speed": "#81c784",
  "Auto-Roll": "#ff8a65"
};

// Shop displays available boosts and handles purchases
export default function Shop({ userId, rubies, onBuyBoost, selectedBoost, setSelectedBoost }) {
  // --- State ---
  const [boosts, setBoosts] = useState([]);
  const [isBuying, setIsBuying] = useState(false);
  const [error, setError] = useState(null);

  // --- Effects: Fetch boosts data ---
  useEffect(() => {
    fetch("/data/boosts.json")
      .then(res => res.json())
      .then(setBoosts)
      .catch(() => setBoosts([]));
  }, []);

  // --- Handlers ---
  function handleBuy(boost, quantity) {
    if (!userId) return;
    setIsBuying(true);
    fetch(`/api/player/${userId}/buy-boost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boostId: boost.id, quantity }),
    })
      .then(res => res.json())
      .then(data => {
        setIsBuying(false);
        if (data.error) {
          setError(data.error);
        } else {
          setError(null);
          onBuyBoost && onBuyBoost(data);
        }
      });
  }

  // --- Group boosts by name/category ---
  const grouped = groupBoosts(boosts);

  // --- Render ---
  return (
    <div className="shop-root shop-categories-root">
      <div className="shop-categories-scroll">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="shop-category-section">
            <div className="shop-category-label">{category}</div>
            <div className="shop-category-divider" />
            <div className="shop-category-grid">
              {items.map(boost => {
                const isSelected = selectedBoost && selectedBoost.id === boost.id;
                return (
                  <div key={boost.id} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <button
                      className={`shop-category-grid-item${isSelected ? " selected" : ""}`}
                      onClick={() => setSelectedBoost(isSelected ? null : boost)}
                      tabIndex={0}
                    >
                      <img src={boost.icon} alt={boost.name} className="shop-category-icon" />
                    </button>
                    <div className="shop-category-price">
                      {boost.price} <span className="shop-category-ruby">💎</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {error && <div className="shop-error">{error}</div>}
    </div>
  );
}