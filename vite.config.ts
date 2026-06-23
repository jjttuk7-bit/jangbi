import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    // OPENAI_API_KEY는 더 이상 클라이언트 번들에 주입하지 않는다.
    // OpenAI 호출은 서버리스 함수(api/diagnosis.ts, api/team-sophia.ts)에서만 수행한다.
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-recharts': ['recharts'],
            'vendor-motion': ['motion'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // 팀소피아 Slack 전송 백엔드(server/index.ts)로 프록시. CORS 회피용.
      proxy: {
        '/api': `http://localhost:${env.SERVER_PORT || process.env.SERVER_PORT || 8787}`,
      },
    },
  };
});
