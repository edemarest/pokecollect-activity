import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const DATA_DIR = path.resolve("./server/data/playerdata");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getPlayerFile(userId) {
  return path.join(DATA_DIR, `${userId}.json`);
}

// Get player state
router.get("/:userId", (req, res) => {
  const file = getPlayerFile(req.params.userId);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    res.json(data);
  } else {
    // Default state
    res.json({ collection: [], rubies: 0, avatarDexNumber: null });
  }
});

// Update player state
router.post("/:userId", (req, res) => {
  const file = getPlayerFile(req.params.userId);
  const { collection, rubies, avatarDexNumber } = req.body;
  const data = { collection, rubies, avatarDexNumber };
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

export default router;
