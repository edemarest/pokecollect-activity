import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import playerRouter from "./routes/player.js";
import leaderboardRouter from "./routes/leaderboard.js";

// Load env vars
dotenv.config({ path: "./.env" });

const app = express();
const port = 3002;

// Allow express to parse JSON bodies
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.VITE_TUNNEL_URL,
    "https://discord.com"
  ],
  credentials: true,
}));

// API routes
app.use("/api/player", playerRouter);
app.use("/api/leaderboard", leaderboardRouter);

// Add /api/token route (copied from server.js)
import fetch from "node-fetch";
app.post("/api/token", async (req, res) => {
  try {
    console.log("/api/token request body:", req.body);
    console.log("Using client_id:", process.env.DISCORD_CLIENT_ID);
    console.log("Using client_secret:", process.env.DISCORD_CLIENT_SECRET);
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.body.code,
      }),
    });
    const discordResponse = await response.json();
    console.log("Discord token endpoint response:", discordResponse);
    const { access_token } = discordResponse;
    if (!access_token) {
      res.status(400).json({ error: "No access token returned", discordResponse });
      return;
    }
    res.send({ access_token });
  } catch (err) {
    console.error("/api/token error:", err);
    res.status(500).json({ error: "Failed to fetch Discord access token" });
  }
});

console.log("client_id:", process.env.VITE_DISCORD_CLIENT_ID);
console.log("client_secret:", process.env.DISCORD_CLIENT_SECRET);

// Serve static files from client/dist
const distPath = path.resolve("../client/dist");
app.use(express.static(distPath));

// Fallback: serve index.html for any unknown route (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Fullstack server listening at http://localhost:${port}`);
});
