import express from "express";
import { getUserData, saveUserData, updateUserData } from "../utils/userData.js";

const router = express.Router();

// Get player state
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  const data = getUserData(userId);
  res.json(data);
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

export default router;
