import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("../server/data/playerdata");

function getUserFilePath(discordId) {
  return path.join(DATA_DIR, `${discordId}.json`);
}

export function getUserData(discordId) {
  const filePath = getUserFilePath(discordId);
  if (!fs.existsSync(filePath)) {
    // Return default user data if not found
    return {
      discordId,
      collection: {},
      power: 0,
      rubies: 0,
      avatar: null,
    };
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function saveUserData(discordId, data) {
  const filePath = getUserFilePath(discordId);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function updateUserData(discordId, updates) {
  const data = getUserData(discordId);
  const newData = { ...data, ...updates };
  saveUserData(discordId, newData);
  return newData;
}

export function getAllUsers() {
  const files = fs.readdirSync(DATA_DIR);
  return files.map(file => {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    return JSON.parse(raw);
  });
}
