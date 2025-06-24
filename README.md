# Pokecollect Activity: Setup & Startup Guide

This project is a fullstack web app with a React/Vite client and a Node.js/Express/WebSocket server.

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- macOS, Linux, or WSL (for running the setup script)
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) (for Cloudflare Tunnel)

## Quick Start (Recommended)

Run the provided setup script to install dependencies and start both the server and client:

```bash
chmod +x setup.sh
./setup.sh
```

- This will install all dependencies and start both the server and client in development mode.
- The client will be available at [http://localhost:5173](http://localhost:5173) (default Vite port).
- The server will run on [http://localhost:3000](http://localhost:3000) (or as configured).

### Expose your local server with Cloudflare Tunnel

After starting the server, run:

```bash
cloudflared tunnel --url http://localhost:3000
```

- This will provide a public URL to your local server via Cloudflare.
- You must have `cloudflared` installed. See [Cloudflare Tunnel Installation Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/).

## Manual Setup

If you prefer to run things manually:

### 1. Install dependencies

#### Server
```bash
cd server
npm install
```

#### Client
```bash
cd client
npm install
```

### 2. Start the server
```bash
cd server
npm run dev
```

### 3. Start the client
```bash
cd client
npm run dev
```

### 4. (Optional) Expose server with Cloudflare Tunnel
```bash
cloudflared tunnel --url http://localhost:3000
```

### Deploying Your Backend for Discord Activity

To use your backend with Discord Activities, you must deploy it to a public domain and request Discord to allowlist your domain for Content Security Policy (CSP).

#### 1. Deploy Your Backend
You can deploy your backend to any public host. Common options:
- **Render**: https://render.com/
- **Railway**: https://railway.app/
- **Fly.io**: https://fly.io/
- **Heroku**: https://heroku.com/
- **Vercel** (for Node.js APIs): https://vercel.com/
- **Cloudflare Tunnel** (for temporary public access): see below

Follow your chosen platform's instructions to deploy your `server/` directory. Make sure your server is accessible via HTTPS and has a public URL.

#### 2. (Optional) Expose Localhost with Cloudflare Tunnel
If you want to temporarily expose your local server for testing:

1. Install `cloudflared` if you haven't already:
   ```bash
   brew install cloudflared  # macOS
   # or see https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```
2. Start your backend server locally:
   ```bash
   cd server
   npm run dev
   ```
3. In a new terminal, run:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
   - This will give you a public `https://` URL that forwards to your local server.

#### 3. Request CSP Allowlisting from Discord
To use your backend with Discord Activities, you must request Discord to allowlist your public domain:
- Go to the [Discord Developer Portal](https://discord.com/developers/applications)
- Select your application
- Go to **Activities > Hosting**
- Add your backend's public URL to the **Content Security Policy** allowlist
- Save changes and wait for approval

**Note:** Cloudflare Tunnel URLs are not suitable for production, but can be used for short-term testing if allowlisted.

## Project Structure
- `client/` — React/Vite frontend
- `server/` — Node.js/Express/WebSocket backend

## Troubleshooting
- Make sure no other process is using ports 3000 or 5173.
- If you encounter issues, try deleting `node_modules` and running `npm install` again in both `client/` and `server/`.
- If `cloudflared` is not found, follow the [installation guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/).

---

For more details, see the Discord Activities documentation: https://discord.com/developers/docs/activities/overview

