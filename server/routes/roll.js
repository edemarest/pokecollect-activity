import express from "express";
const router = express.Router();
import { broadcastRollLog } from "../ws.js";
import fs from "fs/promises";
import path from "path";
import { rollLog, MAX_LOG } from "../logStore.js";

// Weighted random selection
function weightedRandomPokemon(list) {
  const totalWeight = list.reduce((sum, p) => sum + (p.odds || 1), 0);
  let rand = Math.random() * totalWeight;
  for (const p of list) {
    rand -= (p.odds || 1);
    if (rand <= 0) return p;
  }
  return list[list.length - 1];
}

// POST /roll
router.post("/", async (req, res) => {
  try {
    console.log("[/api/roll] Incoming request body:", req.body);

    const { userId } = req.body;
    if (!userId) {
      console.error("[/api/roll] Missing userId in request body");
      return res.status(400).json({ error: "Missing userId" });
    }

    // Try to load the Pokémon data using fs.readFile
    const pokemonPath = path.resolve("data/pokemon.json");
    let pokemonData;
    try {
      const file = await fs.readFile(pokemonPath, "utf-8");
      pokemonData = JSON.parse(file);
      console.log("[/api/roll] Loaded pokemonData, count:", pokemonData.length);
    } catch (importErr) {
      console.error("[/api/roll] Failed to load pokemon.json:", importErr);
      return res.status(500).json({ error: "Failed to load Pokémon data" });
    }

    // Roll a Pokémon
    let pokemon;
    try {
      pokemon = weightedRandomPokemon(pokemonData);
      console.log("[/api/roll] Rolled Pokémon:", pokemon);
    } catch (rollErr) {
      console.error("[/api/roll] Error during rolling:", rollErr);
      return res.status(500).json({ error: "Failed to roll Pokémon" });
    }

    // If rare or higher, add to log and broadcast
    const rareLevels = ["common", "rare", "wild", "legendary", "mythical"];
    if (rareLevels.includes(pokemon.rarity)) {
      let username = userId;
      try {
        const userPath = path.resolve("data/playerdata", `${userId}.json`);
        console.log("[/api/roll] Looking for user file at:", userPath);
        const userJson = await fs.readFile(userPath, "utf-8");
        const user = JSON.parse(userJson);
        if (user && user.discordId) username = user.discordId;
        console.log("[/api/roll] Found user, using discordId:", username);
      } catch (e) {
        console.warn("[/api/roll] Could not read user file or parse discordId, using userId:", userId, "Error:", e.message);
      }
      const logEntry = {
        username,
        dexNumber: pokemon.dexNumber,
        name: pokemon.name,
        rarity: pokemon.rarity,
        timestamp: Date.now()
      };
      rollLog.push(logEntry);
      if (rollLog.length > MAX_LOG) rollLog.shift();
      console.log("[/api/roll] Broadcasting roll log entry:", logEntry);
      try {
        broadcastRollLog(logEntry);
      } catch (wsErr) {
        console.error("[/api/roll] Error broadcasting roll log:", wsErr);
      }
    }

    res.json({ pokemon });
  } catch (err) {
    console.error("[/api/roll] Unexpected error:", err);
    res.status(500).json({ error: "Roll failed" });
  }
});

// GET /roll/log
router.get("/log", (req, res) => {
  res.json({ log: rollLog });
});

export default router;