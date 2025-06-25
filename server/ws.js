import { WebSocketServer } from 'ws';
import { rollLog, MAX_LOG } from "./logStore.js";

const wss = new WebSocketServer({ port: 8080 });

// Store all connected clients for broadcasting
const clients = new Set();

wss.on('connection', function connection(ws) {
  clients.add(ws);
  console.log(`[ws] Client connected. Total clients: ${clients.size}`);
  broadcastSystemLog("A user connected.");

  ws.on('close', function() {
    clients.delete(ws);
    console.log(`[ws] Client disconnected. Total clients: ${clients.size}`);
    broadcastSystemLog("A user disconnected.");
  });

  ws.on('message', function incoming(message) {
    // Handle join, move, etc.
    // Example: { type: 'join', gameId, userId }
    // Example: { type: 'move', gameId, col, userId }
  });
});

// Broadcast a roll log entry to all clients
export function broadcastRollLog(logEntry) {
  const msg = JSON.stringify({ type: "roll-log", data: logEntry });
  console.log("[broadcastRollLog] Broadcasting to", clients.size, "clients. Message:", msg);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(msg);
    }
  }
}

function broadcastSystemLog(message) {
  const logEntry = {
    system: true,
    message,
    timestamp: Date.now()
  };
  // Persist system log
  rollLog.push(logEntry);
  if (rollLog.length > MAX_LOG) rollLog.shift();

  const msg = JSON.stringify({ type: "roll-log", data: logEntry });
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(msg);
    }
  }
}

console.log('WebSocket server running on ws://localhost:8080');