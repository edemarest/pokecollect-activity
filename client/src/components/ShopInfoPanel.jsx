import React, { useState, useEffect, useRef } from "react";
import "../styles/shop.css";

// ShopInfoPanel displays details and purchase options for a selected boost
export default function ShopInfoPanel({ boost, rubies, onBuy, isBuying, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose && onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // --- Render only if a boost is selected ---
  if (!boost) return null;

  // --- Helpers ---
  const canAfford = rubies >= boost.price * quantity;

  // --- Render ---
  return (
    <div className="shop-infopanel-backdrop">
      <div className="shop-info-panel" ref={panelRef}>
        <button className="shop-info-close-btn" onClick={onClose} aria-label="Close">×</button>
        <div className="shop-info-main">
          <img src={boost.icon} alt={boost.name} className="shop-info-icon" />
          <div className="shop-info-details">
            <div className="shop-info-title">{boost.name}</div>
            <div className="shop-info-description">{boost.description}</div>
            <div className="shop-info-duration">
              Duration: {boost.duration >= 60 ? `${boost.duration / 60} min` : `${boost.duration} sec`}
            </div>
            <div className="shop-info-price">
              Price: {boost.price} rubies each
            </div>
          </div>
        </div>
        <div className="shop-info-actions">
          <label>
            Quantity:
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Math.min(99, Number(e.target.value))))}
              disabled={isBuying}
              className="shop-info-quantity-input"
            />
          </label>
          <button
            className="shop-info-buy-btn"
            disabled={!canAfford || isBuying}
            onClick={() => onBuy(boost, quantity)}
          >
            Buy ({boost.price * quantity} rubies)
          </button>
          {!canAfford && <div className="shop-info-insufficient">Not enough rubies!</div>}
        </div>
      </div>
    </div>
  );
}