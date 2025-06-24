import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const DATA_DIR = path.resolve("./server/data/playerdata");

// Get all players for leaderboard
router.get("/", (req, res) => {
  const files = fs.readdirSync(DATA_DIR);
  const players = files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
    // Use filename (userId) as username placeholder for now
    return {
      userId: file.replace(/\.json$/, ""),
      avatarDexNumber: data.avatarDexNumber,
      power: (data.collection || []).reduce((sum, p) => sum + (p.power * (p.amount || 1)), 0),
      // Add more fields as needed
    };
  });
  // Sort by power descending
  players.sort((a, b) => b.power - a.power);
  res.json(players);
});

export default router;
