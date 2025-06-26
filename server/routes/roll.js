// --- Roll API ---
import express from "express";
const router = express.Router();
import { broadcastRollLog } from "../ws.js";
import fs from "fs/promises";
import path from "path";
import { rollLog, MAX_LOG } from "../logStore.js";
import { getUserData, removeExpiredBoosts } from "../utils/userData.js";

// Weighted random selection for Pokémon
function weightedRandomPokemon(list) {
  const totalWeight = list.reduce((sum, p) => sum + (p.odds || 1), 0);
  let rand = Math.random() * totalWeight;
  for (const p of list) {
    rand -= (p.odds || 1);
    if (rand <= 0) return p;
  }
  return list[list.length - 1];
}

// POST /api/roll - Roll for a Pokémon
router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Load user data and remove expired boosts
    const user = removeExpiredBoosts(userId);
    const now = Date.now();
    const luckBoosts = (user.activeBoosts || []).filter(
      b => b.type === "luck" && b.expiresAt > now
    );
    const luckMultiplier = luckBoosts.length > 0
      ? Math.max(...luckBoosts.map(b => b.multiplier))
      : 1;

    // Load Pokémon data
    const pokemonPath = path.resolve("data/pokemon.json");
    let pokemonData;
    try {
      const file = await fs.readFile(pokemonPath, "utf-8");
      pokemonData = JSON.parse(file);
    } catch (importErr) {
      return res.status(500).json({ error: "Failed to load Pokémon data" });
    }

    // Group Pokémon by rarity
    const byRarity = {
      common: [],
      uncommon: [],
      rare: [],
      legendary: [],
      mythical: [],
      wild: []
    };
    for (const p of pokemonData) {
      if (byRarity[p.rarity]) byRarity[p.rarity].push(p);
    }

    // Base weights
    let weights = {
      common: 80,
      uncommon: 15,
      rare: 4,
      legendary: 1,
      mythical: 0.2,
      wild: 0.5
    };
    // Apply luck multiplier to all but common
    for (const rarity of ["uncommon", "rare", "legendary", "mythical", "wild"]) {
      weights[rarity] *= luckMultiplier;
    }

    // Build weighted pool
    let pool = [];
    for (const rarity in byRarity) {
      for (let i = 0; i < Math.round(weights[rarity]); i++) {
        pool = pool.concat(byRarity[rarity]);
      }
    }
    if (pool.length === 0) {
      return res.status(500).json({ error: "No Pokémon available to roll" });
    }

    // Select Pokémon
    const rolled = weightedRandomPokemon(pool);

    // Log and broadcast
    const logEntry = {
      userId,
      pokemon: rolled,
      timestamp: Date.now(),
      luckMultiplier
    };
    rollLog.push(logEntry);
    if (rollLog.length > MAX_LOG) rollLog.shift();
    broadcastRollLog(logEntry);

    res.json({ rolled });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /roll/log - Get roll log
router.get("/log", (req, res) => {
  res.json({ log: rollLog });
});

export default router;