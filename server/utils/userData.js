import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../data/playerdata");

function getUserFilePath(discordId) {
  return path.join(DATA_DIR, `${discordId}.json`);
}

export function getUserData(discordId) {
  const filePath = getUserFilePath(discordId);
  if (!fs.existsSync(filePath)) {
    // Return default user data if not found
    return {
      discordId,
      collection: [],
      power: 0,
      rubies: 0,
      avatar: null,
      activeBoosts: [], // <-- ensure this is always present
    };
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  // Ensure all default fields are present for existing users
  return {
    discordId,
    collection: Array.isArray(data.collection) ? data.collection : [],
    power: data.power || 0,
    rubies: data.rubies || 0,
    avatar: data.avatar || null,
    activeBoosts: Array.isArray(data.activeBoosts) ? data.activeBoosts : [],
    // add other fields as needed
    ...data // spread last to preserve any extra fields
  };
}

export function saveUserData(discordId, data) {
  const filePath = getUserFilePath(discordId);
  const dataToSave = {
    ...data,
    discordId,
    activeBoosts: Array.isArray(data.activeBoosts) ? data.activeBoosts : [],
  };
  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf-8");
}

export function updateUserData(discordId, updates) {
  const data = getUserData(discordId);
  // Always ensure discordId is present
  const newData = { ...data, ...updates, discordId };
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

export function discardPokemon(discordId, dexNumber, amount = 1) {
  const data = getUserData(discordId);
  let updatedCollection = Array.isArray(data.collection) ? [...data.collection] : [];
  let found = false;
  updatedCollection = updatedCollection.map(poke => {
    if (poke.dexNumber === dexNumber && !found) {
      found = true;
      const newAmount = (poke.amount || 1) - amount;
      if (newAmount > 0) {
        return { ...poke, amount: newAmount };
      }
      // If newAmount <= 0, we'll filter it out below
      return null;
    }
    return poke;
  }).filter(Boolean);

  const newData = { ...data, collection: updatedCollection };
  saveUserData(discordId, newData);
  return newData;
}

export function setAvatar(discordId, dexNumber, avatarImage) {
  const data = getUserData(discordId);
  const newData = {
    ...data,
    avatarDexNumber: dexNumber,
    avatarImage: avatarImage || (data.collection.find(p => p.dexNumber === dexNumber)?.image)
  };
  saveUserData(discordId, newData);
  return newData;
}

export function sellPokemon(discordId, dexNumber, amount = 1) {
  const data = getUserData(discordId);
  let updatedCollection = Array.isArray(data.collection) ? [...data.collection] : [];
  let found = false;
  let sellPower = 0;
  updatedCollection = updatedCollection.map(poke => {
    if (poke.dexNumber === dexNumber && !found) {
      found = true;
      const newAmount = (poke.amount || 1) - amount;
      sellPower = (poke.power || 0) * Math.min(amount, poke.amount || 1);
      if (newAmount > 0) {
        return { ...poke, amount: newAmount };
      }
      // If newAmount <= 0, we'll filter it out below
      return null;
    }
    return poke;
  }).filter(Boolean);

  const newRubies = (data.rubies || 0) + sellPower;
  const newData = { ...data, collection: updatedCollection, rubies: newRubies };
  saveUserData(discordId, newData);
  return newData;
}

/**
 * Adds or extends a boost for a user.
 * @param {string} discordId
 * @param {object} boost - { id, type, multiplier, duration (seconds) }
 * @returns {object} updated user data
 */
export function addOrExtendBoost(discordId, boost) {
  const data = getUserData(discordId);
  const now = Date.now();
  let boosts = Array.isArray(data.activeBoosts) ? [...data.activeBoosts] : [];

  // Find existing boost of same type and multiplier
  const idx = boosts.findIndex(
    b => b.type === boost.type && b.multiplier === boost.multiplier
  );

  const durationMs = (boost.duration || 0) * 1000;
  if (idx !== -1) {
    // Extend expiry
    boosts[idx].expiresAt = Math.max(boosts[idx].expiresAt, now) + durationMs;
  } else {
    // Add new boost
    boosts.push({
      id: boost.id,
      type: boost.type,
      multiplier: boost.multiplier,
      expiresAt: now + durationMs
    });
  }

  const newData = { ...data, activeBoosts: boosts };
  saveUserData(discordId, newData);
  return newData;
}

/**
 * Removes expired boosts for a user.
 * @param {string} discordId
 * @returns {object} updated user data
 */
export function removeExpiredBoosts(discordId) {
  const data = getUserData(discordId);
  const now = Date.now();
  const boosts = (data.activeBoosts || []).filter(
    b => b.expiresAt > now
  );
  if (boosts.length !== (data.activeBoosts || []).length) {
    const newData = { ...data, activeBoosts: boosts };
    saveUserData(discordId, newData);
    return newData;
  }
  return data;
}

// New function to handle boost purchase
export function purchaseBoost(userId, boostDef, quantity, totalPrice) {
  let user = getUserData(userId);
  user.rubies -= totalPrice;
  for (let i = 0; i < quantity; i++) {
    addOrExtendBoost(userId, boostDef); // <-- no 'let' here!
  }
  saveUserData(userId, user);
  return { success: true, rubies: user.rubies, activeBoosts: user.activeBoosts };
}
