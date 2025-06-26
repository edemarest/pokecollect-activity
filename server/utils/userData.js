// --- User Data Utilities ---
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data/playerdata");

// Get the file path for a user's data
function getUserFilePath(discordId) {
  return path.join(DATA_DIR, `${discordId}.json`);
}

// Get user data, or default if not found
export function getUserData(discordId) {
  const filePath = getUserFilePath(discordId);
  if (!fs.existsSync(filePath)) {
    return {
      discordId,
      collection: [],
      power: 0,
      rubies: 0,
      avatar: null,
      activeBoosts: [],
    };
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  return {
    discordId,
    collection: Array.isArray(data.collection) ? data.collection : [],
    power: data.power || 0,
    rubies: data.rubies || 0,
    avatar: data.avatar || null,
    activeBoosts: Array.isArray(data.activeBoosts) ? data.activeBoosts : [],
    ...data
  };
}

// Save user data to file
export function saveUserData(discordId, data) {
  const filePath = getUserFilePath(discordId);
  const dataToSave = {
    ...data,
    discordId,
    activeBoosts: Array.isArray(data.activeBoosts) ? data.activeBoosts : [],
  };
  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf-8");
}

// Update user data with partial updates
export function updateUserData(discordId, updates) {
  const data = getUserData(discordId);
  const newData = { ...data, ...updates, discordId };
  saveUserData(discordId, newData);
  return newData;
}

// Get all users' data
export function getAllUsers() {
  const files = fs.readdirSync(DATA_DIR);
  return files.map(file => {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    return JSON.parse(raw);
  });
}

// Claim a Pokémon for a user
export function claimPokemon(discordId, pokemon) {
  const data = getUserData(discordId);
  let found = false;
  let updatedCollection = Array.isArray(data.collection) ? [...data.collection] : [];
  for (let i = 0; i < updatedCollection.length; i++) {
    if (updatedCollection[i].dexNumber === pokemon.dexNumber) {
      updatedCollection[i] = {
        ...updatedCollection[i],
        amount: (updatedCollection[i].amount || 1) + 1
      };
      found = true;
      break;
    }
  }
  if (!found) {
    updatedCollection.push({ ...pokemon, amount: 1 });
  }
  const newData = { ...data, collection: updatedCollection };
  saveUserData(discordId, newData);
  return newData;
}

// Discard a Pokémon from a user's collection
export function discardPokemon(discordId, dexNumber, amount = 1) {
  const data = getUserData(discordId);
  let updatedCollection = Array.isArray(data.collection) ? [...data.collection] : [];
  updatedCollection = updatedCollection.map(p => {
    if (p.dexNumber === dexNumber) {
      return { ...p, amount: Math.max(0, (p.amount || 1) - amount) };
    }
    return p;
  }).filter(p => p.amount > 0);
  const newData = { ...data, collection: updatedCollection };
  saveUserData(discordId, newData);
  return newData;
}

// Set a user's avatar Pokémon
export function setAvatar(discordId, dexNumber, avatarImage) {
  const data = getUserData(discordId);
  const newData = { ...data, avatarDexNumber: dexNumber, avatarImage };
  saveUserData(discordId, newData);
  return newData;
}

// Sell a Pokémon from a user's collection
export function sellPokemon(discordId, dexNumber, amount = 1) {
  const data = getUserData(discordId);
  let updatedCollection = Array.isArray(data.collection) ? [...data.collection] : [];
  let rubies = data.rubies || 0;
  let sold = false;
  updatedCollection = updatedCollection.map(p => {
    if (p.dexNumber === dexNumber && (p.amount || 1) >= amount) {
      sold = true;
      rubies += (p.power || 1) * amount;
      return { ...p, amount: (p.amount || 1) - amount };
    }
    return p;
  }).filter(p => p.amount > 0);
  if (!sold) return data;
  const newData = { ...data, collection: updatedCollection, rubies };
  saveUserData(discordId, newData);
  return newData;
}

// Add or extend a boost for a user
export function addOrExtendBoost(discordId, boost, quantity = 1) {
  const data = getUserData(discordId);
  let rubies = data.rubies || 0;
  const totalCost = boost.price * quantity;
  if (rubies < totalCost) return data;
  rubies -= totalCost;
  let activeBoosts = Array.isArray(data.activeBoosts) ? [...data.activeBoosts] : [];
  let found = false;
  for (let i = 0; i < activeBoosts.length; i++) {
    if (activeBoosts[i].id === boost.id) {
      activeBoosts[i] = {
        ...activeBoosts[i],
        expiresAt: activeBoosts[i].expiresAt + boost.duration * 1000 * quantity
      };
      found = true;
      break;
    }
  }
  if (!found) {
    activeBoosts.push({
      ...boost,
      expiresAt: Date.now() + boost.duration * 1000 * quantity
    });
  }
  const newData = { ...data, activeBoosts, rubies };
  saveUserData(discordId, newData);
  return newData;
}

// Remove expired boosts from a user's data
export function removeExpiredBoosts(discordId) {
  const data = getUserData(discordId);
  const now = Date.now();
  const activeBoosts = (data.activeBoosts || []).filter(b => b.expiresAt > now);
  const newData = { ...data, activeBoosts };
  saveUserData(discordId, newData);
  return newData;
}
