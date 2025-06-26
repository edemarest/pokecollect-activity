// --- Player Leaderboard API ---
import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const DATA_DIR = path.resolve(__dirname, "../data/playerdata");

// Calculate total power for a player's collection
function calculatePower(collection) {
  return (collection || []).reduce((sum, p) => sum + (p.power * (p.amount || 1)), 0);
}

// GET /api/leaderboard - Returns all players sorted by power
router.get("/", (req, res) => {
  const files = fs.readdirSync(DATA_DIR);
  const players = files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
    const userId = data.discordId || file.replace(/\.json$/, "");
    return {
      userId,
      avatarDexNumber: data.avatarDexNumber,
      avatarImage: data.avatarImage,
      power: calculatePower(data.collection),
      rubies: data.rubies || 0,
    };
  });
  players.sort((a, b) => b.power - a.power);
  res.json(players);
});

export default router;
