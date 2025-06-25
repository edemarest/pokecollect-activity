import React from "react";
import { createRoot } from "react-dom/client";
import App from "./src/App";
import "./style.css";
import { DiscordSDK } from "@discord/embedded-app-sdk";
// console.log("main.jsx loaded");
// console.log("window.location.search:", window.location.search);
// console.log("Discord Client ID (top):", import.meta.env.VITE_DISCORD_CLIENT_ID);
// console.log("All env:", import.meta.env);
// console.log("DiscordNative:", window.DiscordNative);
// console.log("DiscordActivity:", window.DiscordActivity);

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
    try {
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
      // Use Discord-proxied URL if running as a Discord Activity
      const isDiscordActivity = window.location.search.includes("frame_id");
      const TOKEN_URL = isDiscordActivity
        ? `https://${import.meta.env.VITE_DISCORD_CLIENT_ID}.discordsays.com/.proxy/api/token`
        : "/api/token";
      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      console.log("After fetch /api/token", response);
      if (!response.ok) {
        const text = await response.text();
        console.error("/api/token failed", response.status, text);
        throw new Error("/api/token failed: " + response.status + " " + text);
      }
      let access_token = null;
      try {
        const json = await response.json();
        console.log("Token response JSON:", json);
        access_token = json.access_token;
      } catch (e) {
        console.error("Failed to parse /api/token response as JSON", e);
        throw new Error("Invalid JSON from /api/token");
      }
      if (!access_token) {
        throw new Error("No access token received from /api/token");
      }
      // Authenticate with Discord client (using the access_token)
      try {
        auth = await discordSdk.commands.authenticate({
          access_token,
        });
      } catch (e) {
        console.error("discordSdk.commands.authenticate failed", e);
        throw e;
      }
      if (auth == null) {
        throw new Error("Authenticate command failed");
      }
    } catch (err) {
      console.error("setupDiscordSdk error:", err);
      document.body.innerHTML = `<div style="color:red;padding:40px;">Discord Activity failed to load: ${err && err.message ? err.message : JSON.stringify(err)}</div>`;
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

