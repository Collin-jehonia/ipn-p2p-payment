# Installation Guide

## Prerequisites

- **Node.js** v18 or later (developed with v20)
- **npm** v9 or later

## Install Dependencies

From the project root:

```bash
# Install all dependencies (server + client)
npm run install:all

# OR install individually:
npm install --include=dev --prefix server
npm install --include=dev --prefix client
```

> **Note**: If your npm config has `omit=dev` set globally, use `--include=dev` to ensure development dependencies (Vite, Nodemon) are installed.

## Running the Application

### Development Mode (Recommended)

Start both server and client simultaneously:

```bash
npm run dev
```

This runs:
- **Server** on `http://localhost:3001` (with auto-reload via Nodemon)
- **Client** on `http://localhost:5173` (with HMR via Vite)

### Run Individually

```bash
# Start only the server
npm run server

# Start only the client
npm run client
```

### Production Build

```bash
# Build the client for production
npm run build

# Start the server (serves the API)
npm start
```

## Running Tests

```bash
# Run server tests (82 tests — Jest + supertest)
cd server && npm test

# Run client tests (53 tests — Vitest + React Testing Library)
cd client && npm test
```

## Running with Docker

### Prerequisites

- **Docker** and **Docker Compose** installed

### Start the application

```bash
docker-compose up --build
```

This builds and starts two containers:
- **ipn-p2p-server** — Express Mock API on `http://localhost:3001`
- **ipn-p2p-client** — React frontend (Nginx) on `http://localhost:8080`

### Stop the application

```bash
docker-compose down
```

### Run in detached mode

```bash
docker-compose up --build -d
```

### View logs

```bash
# All services
docker-compose logs -f

# Server only
docker-compose logs -f server

# Client only
docker-compose logs -f client
```

## Troubleshooting

| Issue | Solution |
|---|---|
| `vite: command not found` | Run `npm install --include=dev --prefix client` |
| `nodemon: command not found` | Run `npm install --include=dev --prefix server` |
| Port 3001 already in use | Kill the process on port 3001: `lsof -ti:3001 \| xargs kill` |
| Port 5173 already in use | Vite will auto-select the next available port |
| Port 8080 already in use (Docker) | Change the client port in `docker-compose.yml` |
| CORS errors in browser | Ensure the server is running — Vite proxies `/api/*` to `localhost:3001` |
