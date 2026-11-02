# Exercise-Chat

Applicazione di chat in tempo reale con registrazione e login degli utenti.
Gli utenti si registrano, accedono e scrivono messaggi che arrivano subito a tutti
i partecipanti. Ognuno può cancellare solo i propri messaggi.

## Funzionalità

- Registrazione e login con password cifrata (bcrypt) e token JWT
- Chat in tempo reale con Socket.io, con connessione autenticata
- Cronologia dei messaggi caricata all'apertura della chat
- Cancellazione dei propri messaggi, aggiornata in tempo reale per tutti
- Gestione utenti: elenco, modifica nome utente, cambio password, eliminazione

## Tecnologie

| Parte | Tecnologie |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Socket.io-client |
| Backend | Node.js, Express 5, Socket.io, JWT, bcrypt |
| Database | PostgreSQL (Docker in locale, Render online) tramite Sequelize. In alternativa SQLite |
| Sviluppo | Docker e Docker Compose |
| Deploy | GitHub + Render |

## Struttura del progetto

```
.
├── compose.yaml              # avvia database, backend e frontend insieme
├── .env                      # variabili segrete(Token)
├── backend-dockerfile/       # backend Express + Socket.io
│   ├── server.js
│   ├── routes/               # auth, messages, users
│   ├── data/                 # dbConfig.js e dataService.js (modelli e logica)
│   ├── socket/               # eventi Socket.io
│   └── Dockerfile
└── client/                   # frontend React
    ├── src/
    │   ├── pages/            # Login, Register, Chat
    │   └── config.js         # indirizzo del backend
    └── Dockerfile
```

## Avvio in locale con Docker

Serve solo [Docker Desktop](https://www.docker.com/products/docker-desktop/).
PostgreSQL parte da solo come container: non va installato sul PC.

1. Crea un file `.env` nella cartella principale:
   ```
   JWT_SECRET=una-stringa-lunga-e-casuale
   ```
2. Avvia tutto:
   ```bash
   docker compose up --build
   ```
3. Apri http://localhost:5173 e registra un utente.

Il backend risponde su http://localhost:8000.

Comandi utili:

```bash
docker compose down              # ferma i container
docker compose up --build -V     # dopo aver aggiunto una dipendenza
docker compose down -v           # ferma tutto e cancella anche il database locale
```

Le modifiche al codice si aggiornano da sole, senza ricostruire i container.

## Variabili d'ambiente

| Variabile | Dove | Descrizione |
|---|---|---|
| `JWT_SECRET` | backend | Chiave per firmare i token di accesso (obbligatoria) |
| `DATABASE_URL` | backend | Indirizzo PostgreSQL. Se manca, usa il file SQLite locale |
| `DB_SSL` | backend | Metti `false` solo per il Postgres locale di Docker |
| `PORT` | backend | Porta del server (default `8000`, su Render la imposta lui) |
| `VITE_API_URL` | frontend | Indirizzo del backend (default `http://localhost:8000`) |

## API

Tutte le rotte, tranne registrazione e login, richiedono l'header
`Authorization: Bearer <token>`.

| Metodo | Rotta | Descrizione |
|---|---|---|
| POST | `/auth/register` | Registra un utente e restituisce il token |
| POST | `/auth/login` | Accesso, restituisce il token |
| GET | `/messages` | Elenco dei messaggi |
| POST | `/messages` | Crea un messaggio |
| GET | `/users` | Elenco degli utenti |
| GET | `/users/:username` | Dettaglio di un utente |
| PUT | `/users/:username` | Modifica il nome utente |
| PUT | `/users/:username/password` | Cambia la password |
| DELETE | `/users/:username` | Elimina un utente |

### Eventi Socket.io

Il token viene inviato in `auth.token` al momento della connessione.

| Evento | Direzione | Descrizione |
|---|---|---|
| `message` | client → server | Invia un nuovo messaggio (`{ content }`) |
| `message` | server → tutti | Nuovo messaggio ricevuto |
| `deleteMessage` | client → server | Cancella un proprio messaggio (`{ messageId }`) |
| `messageDeleted` | server → tutti | Messaggio cancellato (`{ messageId }`) |
| `message:error` | server → client | Errore di validazione o autorizzazione |



