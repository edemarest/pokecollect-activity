import axios from "axios";

// Detect if running as a Discord Activity
const isDiscordActivity = window.location.search.includes("frame_id");
const API_BASE = isDiscordActivity
  ? `https://${import.meta.env.VITE_DISCORD_CLIENT_ID}.discordsays.com/.proxy/api/player`
  : "/api/player";
const LEADERBOARD_API = isDiscordActivity
  ? `https://${import.meta.env.VITE_DISCORD_CLIENT_ID}.discordsays.com/.proxy/api/leaderboard`
  : "/api/leaderboard";

export async function getPlayerState(userId) {
  const res = await axios.get(`${API_BASE}/${userId}`);
  return res.data;
}

export async function setPlayerState(userId, state) {
  await axios.post(`${API_BASE}/${userId}`, state);
}

export async function patchPlayerState(userId, updates) {
  await axios.patch(`${API_BASE}/${userId}`, updates);
}

export async function setPlayerAvatar(userId, avatar) {
  await patchPlayerState(userId, { avatar });
}

export async function getLeaderboard() {
  const res = await axios.get(LEADERBOARD_API);
  return res.data;
}
