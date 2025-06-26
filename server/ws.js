import { WebSocketServer } from 'ws';
import { rollLog, MAX_LOG } from "./logStore.js";

// --- WebSocket Server Setup ---
const wss = new WebSocketServer({ port: 8080 });
const clients = new Set();

// --- Connection Handling ---
wss.on('connection', function connection(ws) {
  clients.add(ws);
  broadcastSystemLog("A user connected.");

  ws.on('close', function() {
    clients.delete(ws);
    broadcastSystemLog("A user disconnected.");
  });

  ws.on('message', function incoming(message) {
    // Reserved for future message handling (e.g., join, move, etc.)
  });
});

// --- Broadcast Roll Log Entry to All Clients ---
export function broadcastRollLog(logEntry) {
  const msg = JSON.stringify({ type: "roll-log", data: logEntry });
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(msg);
    }
  }
}

// --- Broadcast System Log Entry ---
function broadcastSystemLog(message) {
  const logEntry = {
    system: true,
    message,
    timestamp: Date.now()
  };
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