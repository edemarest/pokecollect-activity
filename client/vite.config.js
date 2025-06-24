import {defineConfig, loadEnv} from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Debug logs for env and tunnel host
  console.log('Loaded env:', env);
  let tunnelHost = '';
  if (env.VITE_TUNNEL_URL) {
    try {
      tunnelHost = new URL(env.VITE_TUNNEL_URL).hostname;
    } catch {
      tunnelHost = env.VITE_TUNNEL_URL.replace(/^https?:\/\//, '');
    }
    console.log('Tunnel host for allowedHosts:', tunnelHost);
  } else {
    console.log('No VITE_TUNNEL_URL found in env');
  }
  return {
    envDir: '../',
    server: {
      allowedHosts: [
        'localhost',
        ...(tunnelHost ? [tunnelHost] : [])
      ],
      proxy: {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
      hmr: {
        clientPort: 5173,
      },
    },
  };
});
