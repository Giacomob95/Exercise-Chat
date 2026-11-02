import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// In Docker il backend si chiama "server"; fuori da Docker resta localhost.
const target = process.env.BACKEND_URL || 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // socket: obbligatorio, perché in Chat.jsx usi io('/')
      '/socket.io': {
        target,
        ws: true,
      },
      // Express: serve solo se in axios usi URL relativi
      '/auth': target,
      '/messages': target,
      '/users': target,
    },
  },
})
