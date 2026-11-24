import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Puerto fijo: debe coincidir con las URLs permitidas en la app de Auth0.
  // strictPort evita que Vite use otro puerto si el 5173 está ocupado.
  server: { port: 5173, strictPort: true },
});
