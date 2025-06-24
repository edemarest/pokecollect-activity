import React from "react";
import { createRoot } from "react-dom/client";
import App from "./src/App";
import "./style.css";
import { DiscordSDK } from "@discord/embedded-app-sdk";
console.log("main.jsx loaded");
console.log("window.location.search:", window.location.search);
console.log("Discord Client ID (top):", import.meta.env.VITE_DISCORD_CLIENT_ID);
console.log("All env:", import.meta.env);

// Only initialize DiscordSDK if running inside Discord (frame_id present)
if (window.location.search.includes("frame_id")) {
  console.log("Detected Discord Activity frame_id, initializing Discord SDK...");
  let auth;
  // Log again right before using
  console.log("Discord Client ID (before SDK):", import.meta.env.VITE_DISCORD_CLIENT_ID);
  const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

  setupDiscordSdk().then(() => {
    const root = createRoot(document.getElementById("app"));
    root.render(
      <React.StrictMode>
        <App discordSdk={discordSdk} auth={auth} />
      </React.StrictMode>
    );
  });

  async function setupDiscordSdk() {
    console.log("setupDiscordSdk called");
    console.log("Before discordSdk.ready()");
    await discordSdk.ready();
    console.log("After discordSdk.ready()");
    console.log("Discord Client ID:", import.meta.env.VITE_DISCORD_CLIENT_ID);

    // Authorize with Discord Client
    console.log("Before authorize");
    const { code } = await discordSdk.commands.authorize({
      client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify", "guilds", "applications.commands"],
    });
    console.log("After authorize, code:", code);

    console.log("Calling /api/token with code:", code);
    // Retrieve an access_token from your activity's server
    console.log("Before fetch /api/token");
    const response = await fetch("/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    console.log("After fetch /api/token");
    if (!response.ok) {
      console.error("/api/token failed", response.status);
      throw new Error("/api/token failed: " + response.status);
    }
    let access_token = null;
    try {
      const json = await response.json();
      access_token = json.access_token;
    } catch (e) {
      console.error("Failed to parse /api/token response as JSON", e);
      throw new Error("Invalid JSON from /api/token");
    }

    // Authenticate with Discord client (using the access_token)
    auth = await discordSdk.commands.authenticate({
      access_token,
    });

    if (auth == null) {
      throw new Error("Authenticate command failed");
    }
  }
} else {
  console.log("Not running in Discord Activity, rendering local app");
  // For local development, just render the app without DiscordSDK
  const root = createRoot(document.getElementById("app"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Express route to handle token exchange
app.post("/api/token", async (req, res) => {
  try {
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: req.body.code,
        redirect_uri: "https://127.0.0.1", // <--- must match exactly!
      }),
    });
    const data = await response.json();
    if (!data.access_token) {
      console.error("Discord token error:", data);
    }
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Discord access token" });
  }
});

