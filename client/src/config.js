// Indirizzo del backend. Online viene da VITE_API_URL (impostata su Render),
// in locale resta http://localhost:8000
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
