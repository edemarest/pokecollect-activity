// --- Player Data API ---
import express from "express";
import { addOrExtendBoost, getUserData, saveUserData, updateUserData, claimPokemon, discardPokemon, setAvatar, sellPokemon, removeExpiredBoosts } from "../utils/userData.js";
import { BOOSTS } from "../data/boosts.js";

const router = express.Router();

// GET /api/player/:userId - Get player state (removes expired boosts)
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  const user = removeExpiredBoosts(userId);
  res.json(user);
});

// POST /api/player/:userId - Replace player state
router.post("/:userId", (req, res) => {
  const userId = req.params.userId;
  const { collection, power, rubies, avatar } = req.body;
  const data = { discordId: userId, collection, power, rubies, avatar };
  saveUserData(userId, data);
  res.json({ success: true });
});

// PATCH /api/player/:userId - Partial update
router.patch("/:userId", (req, res) => {
  const userId = req.params.userId;
  const updates = req.body;
  const newData = updateUserData(userId, updates);
  res.json(newData);
});

// POST /api/player/:userId/claim - Claim a Pokémon
router.post("/:userId/claim", (req, res) => {
  const userId = req.params.userId;
  const pokemon = req.body.pokemon;
  if (!pokemon || !pokemon.dexNumber) {
    return res.status(400).json({ error: "Missing pokemon or dexNumber" });
  }
  const updated = claimPokemon(userId, pokemon);
  res.json({ success: true, collection: updated.collection });
});

// POST /api/player/:userId/discard - Discard a Pokémon
router.post("/:userId/discard", (req, res) => {
  const userId = req.params.userId;
  const { dexNumber, amount = 1 } = req.body;
  if (!dexNumber) {
    return res.status(400).json({ error: "Missing dexNumber" });
  }
  const updated = discardPokemon(userId, dexNumber, amount);
  res.json({ success: true, collection: updated.collection });
});

// POST /api/player/:userId/avatar - Set avatar Pokémon
router.post("/:userId/avatar", (req, res) => {
  const userId = req.params.userId;
  const { dexNumber, avatarImage } = req.body;
  if (!dexNumber) {
    return res.status(400).json({ error: "Missing dexNumber" });
  }
  const updated = setAvatar(userId, dexNumber, avatarImage);
  res.json({ success: true, avatarDexNumber: updated.avatarDexNumber, avatarImage: updated.avatarImage });
});

// POST /api/player/:userId/sell - Sell a Pokémon
router.post("/:userId/sell", (req, res) => {
  const userId = req.params.userId;
  const { dexNumber, amount = 1 } = req.body;
  if (!dexNumber || amount < 1) {
    return res.status(400).json({ error: "Missing dexNumber or invalid amount" });
  }
  const updated = sellPokemon(userId, dexNumber, amount);
  res.json({ success: true, collection: updated.collection, rubies: updated.rubies });
});

// POST /api/player/:userId/buy-boost - Buy a boost
router.post("/:userId/buy-boost", (req, res) => {
  const userId = req.params.userId;
  const { boostId, quantity = 1 } = req.body;
  if (!boostId || quantity < 1) {
    return res.status(400).json({ error: "Missing boostId or invalid quantity" });
  }
  const boost = BOOSTS.find(b => b.id === boostId);
  if (!boost) {
    return res.status(400).json({ error: "Invalid boostId" });
  }
  const updated = addOrExtendBoost(userId, boost, quantity);
  res.json({ success: true, activeBoosts: updated.activeBoosts, rubies: updated.rubies });
});

export default router;
