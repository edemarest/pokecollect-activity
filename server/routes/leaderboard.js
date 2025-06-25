import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const DATA_DIR = path.resolve(__dirname, "../data/playerdata");

function calculatePower(collection) {
  return (collection || []).reduce((sum, p) => sum + (p.power * (p.amount || 1)), 0);
}

// Get all players for leaderboard
router.get("/", (req, res) => {
  const files = fs.readdirSync(DATA_DIR);
  const players = files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
    const userId = data.discordId || file.replace(/\.json$/, "");
    // console.log("Calculating power for user:", userId, "collection:", data.collection);
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
