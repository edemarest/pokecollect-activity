import express from "express";
import { addOrExtendBoost, getUserData, saveUserData, updateUserData, claimPokemon, discardPokemon, setAvatar, sellPokemon, removeExpiredBoosts } from "../utils/userData.js";
import { BOOSTS } from "../data/boosts.js"; // You may need to create this file

const router = express.Router();

// Get player state
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  const user = removeExpiredBoosts(userId); // Clean up expired boosts
  res.json(user);
});

// Update player state (full replace)
router.post("/:userId", (req, res) => {
  const userId = req.params.userId;
  // Accepts full user data object
  const { collection, power, rubies, avatar } = req.body;
  const data = { discordId: userId, collection, power, rubies, avatar };
  saveUserData(userId, data);
  res.json({ success: true });
});

// Partial update (patch)
router.patch("/:userId", (req, res) => {
  const userId = req.params.userId;
  const updates = req.body;
  const newData = updateUserData(userId, updates);
  res.json(newData);
});

// Claim a Pokémon
router.post("/:userId/claim", (req, res) => {
  const userId = req.params.userId;
  const pokemon = req.body.pokemon;
  if (!pokemon || !pokemon.dexNumber) {
    return res.status(400).json({ error: "Missing pokemon or dexNumber" });
  }
  const updated = claimPokemon(userId, pokemon);
  // console.log(`[CLAIM] User ${userId} claimed ${pokemon.name} (#${pokemon.dexNumber})`);
  res.json({ success: true, collection: updated.collection });
});

// Discard a Pokémon
router.post("/:userId/discard", (req, res) => {
  const userId = req.params.userId;
  const { dexNumber, amount = 1 } = req.body;
  if (!dexNumber) {
    return res.status(400).json({ error: "Missing dexNumber" });
  }
  const updated = discardPokemon(userId, dexNumber, amount);
  // console.log(`[DISCARD] User ${userId} discarded dex #${dexNumber} (amount: ${amount})`);
  res.json({ success: true, collection: updated.collection });
});

// Set avatar Pokémon
router.post("/:userId/avatar", (req, res) => {
  const userId = req.params.userId;
  const { dexNumber, avatarImage } = req.body;
  if (!dexNumber) {
    return res.status(400).json({ error: "Missing dexNumber" });
  }
  const updated = setAvatar(userId, dexNumber, avatarImage);
  // console.log(`[AVATAR] User ${userId} set avatar to dex #${dexNumber}`);
  res.json({ success: true, avatarDexNumber: updated.avatarDexNumber, avatarImage: updated.avatarImage });
});

// Sell a Pokémon
router.post("/:userId/sell", (req, res) => {
  const userId = req.params.userId;
  const { dexNumber, amount = 1 } = req.body;
  if (!dexNumber || amount < 1) {
    return res.status(400).json({ error: "Missing dexNumber or invalid amount" });
  }
  const updated = sellPokemon(userId, dexNumber, amount);
  // console.log(`[SELL] User ${userId} sold dex #${dexNumber} (amount: ${amount})`);
  res.json({ success: true, collection: updated.collection, rubies: updated.rubies });
});

// Buy a boost
router.post("/:userId/buy-boost", (req, res) => {
  const userId = req.params.userId;
  const { boostId, quantity = 1 } = req.body;
  if (!boostId || quantity < 1) {
    return res.status(400).json({ error: "Missing boostId or invalid quantity" });
  }

  // Find the boost definition
  const boostDef = BOOSTS.find(b => b.id === boostId);
  if (!boostDef) {
    return res.status(400).json({ error: "Invalid boostId" });
  }

  // Get user data
  const user = getUserData(userId);
  const totalPrice = boostDef.price * quantity;
  if (user.rubies < totalPrice) {
    return res.status(400).json({ error: "Not enough rubies" });
  }

  // Deduct rubies and add/extend boost
  user.rubies -= totalPrice;
  for (let i = 0; i < quantity; i++) {
    addOrExtendBoost(userId, boostDef);
  }
  saveUserData(userId, user);

  res.json({ success: true, rubies: user.rubies, activeBoosts: user.activeBoosts });
});


export default router;
