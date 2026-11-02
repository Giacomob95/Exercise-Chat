# NODEproject

Chat in tempo reale: React (client) + Node/Express/Socket.io (backend-dockerfile).

## In locale con Docker
Il database è un container PostgreSQL (non serve installare nulla sul PC).
1. Crea un file `.env` nella cartella principale (vedi `.env.example`).
2. `docker compose up --build`
3. Apri http://localhost:5173

Dopo aver aggiunto una dipendenza: `docker compose up --build -V`

## Online su Render
- **Database**: New > Postgres (Free). Copia l'Internal Database URL.
- **Backend**: New > Web Service. Root Directory `backend-dockerfile`,
  Build `npm install`, Start `npm start`.
  Variabili: `JWT_SECRET`, `DATABASE_URL`.
- **Frontend**: New > Static Site. Root Directory `client`,
  Build `npm install && npm run build`, Publish `dist`.
  Variabile: `VITE_API_URL` = indirizzo del backend (senza `/` finale).
