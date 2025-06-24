import axios from "axios";

const API_BASE = "/api/player";
const LEADERBOARD_API = "/api/leaderboard";

export async function getPlayerState(userId) {
  const res = await axios.get(`${API_BASE}/${userId}`);
  return res.data;
}

export async function setPlayerState(userId, state) {
  await axios.post(`${API_BASE}/${userId}`, state);
}

export async function getLeaderboard() {
  const res = await axios.get(LEADERBOARD_API);
  return res.data;
}
