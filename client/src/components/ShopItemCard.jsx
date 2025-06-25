import React from "react";
import "../styles/shop.css";

export default function ShopItemCard({ boost, rubies, onClick, expanded }) {
  if (!boost) return null;
  return (
    <div className={`shop-item-card${expanded ? " expanded" : ""}`} onClick={onClick}>
      <img src={boost.icon} alt={boost.name} className="shop-item-icon" />
      <div className="shop-item-name">{boost.name}</div>
      {/* <div className="shop-item-effect">{boost.description}</div> */}
      <div className="shop-item-duration">
        Duration: {boost.duration >= 60 ? `${boost.duration / 60} min` : `${boost.duration} sec`}
      </div>
      <div className="shop-item-price">
        <span>{boost.price} rubies</span>
        {rubies !== undefined && rubies < boost.price && (
          <span className="shop-item-insufficient"> (Not enough!)</span>
        )}
      </div>
    </div>
  );
}