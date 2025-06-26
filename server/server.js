import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import playerRouter from "./routes/player.js";
import leaderboardRouter from "./routes/leaderboard.js";
import rollRouter from "./routes/roll.js";
import fetch from "node-fetch";

dotenv.config({ path: "./.env" });

const app = express();
const port = 3002;

// --- Middleware ---
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.VITE_TUNNEL_URL,
    "https://discord.com"
  ],
  credentials: true,
}));

// --- API Routes ---
app.use("/api/player", playerRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/roll", rollRouter);

// --- Discord OAuth Token Exchange ---
app.post("/api/token", async (req, res) => {
  try {
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.body.code,
      }),
    });
    const discordResponse = await response.json();
    const { access_token } = discordResponse;
    if (!access_token) {
      res.status(400).json({ error: "No access token returned", discordResponse });
      return;
    }
    res.send({ access_token });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Discord access token" });
  }
});

// --- Static File Serving ---
const distPath = path.resolve("../client/dist");
app.use(express.static(distPath));

// --- SPA Fallback ---
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Fullstack server listening at http://localhost:${port}`);
});
