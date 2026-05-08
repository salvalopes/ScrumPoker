# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`backend/`)
```bash
dotnet run                        # Start API on http://localhost:5078
dotnet build                      # Build
dotnet publish -c Release -o out  # Publish
```

### Frontend (`frontend/`)
```bash
npm run dev    # Start dev server on http://localhost:5173
npm run build  # Type-check + Vite build
```

### Docker
```bash
docker compose -f docker-compose.dev.yml up   # Dev (exposes API on 5078)
docker compose up                              # Production build
```

### IIS deployment (Windows)
```bat
setup\Install.bat production   # Builds and stages under artifacts\Site\production\package
setup\Install.bat staging
```

## Architecture

### Real-time flow
All room state is kept **in memory** in a single `PokerRoomService` singleton (thread-safe with a `lock`). There is no database. This means only one backend instance may run at a time — horizontal scaling would lose room state.

Clients connect via **SignalR** (`/hubs/poker`). Every mutating action (join, vote, reveal, reset, disconnect) calls `PokerRoomService`, then broadcasts the full `RoomStateDto` to all clients via `RoomStateUpdated`. The only REST endpoint (`GET /api/room/state`) is used by the frontend on initial page load before the SignalR connection is established.

### Backend layout
- `Hubs/PokerHub.cs` — SignalR hub; thin wrapper that calls the service and broadcasts state
- `Services/PokerRoomService.cs` — all business logic and state; valid vote values are `[1, 2, 3, 5, 8, 13, 20, 40, 100]`
- `Controllers/RoomController.cs` — single `GET /api/room/state` endpoint
- `Contracts/` — DTOs shared between hub and controller (`RoomStateDto`, `ParticipantDto`, `HubActionResultDto`)
- `Models/` — internal mutable state classes (`PokerRoomState`, `PokerParticipant`)

### Frontend layout
- `hooks/usePokerHub.ts` — single hook that owns the SignalR connection lifecycle, reconnection logic, and exposes `vote/revealVotes/resetVotes` actions
- `services/appConfig.ts` — reads `VITE_API_BASE_URL` / `VITE_HUB_URL` env vars; in dev these are unset and Vite's proxy handles routing
- `config/poker.ts` — hub event/method name constants and vote values
- `pages/` — `LoginPage` (display name entry) and `RoomPage` (voting UI)

### Dev proxy
Vite proxies `/api` and `/hubs` (including WebSocket upgrade) to `http://localhost:5078`, so the frontend never needs env vars locally. CORS in `appsettings.Development.json` allows `http://localhost:5173`.

### IIS deployment
The `setup/default.build` MSBuild script builds the frontend (copying a `.env.production` from `setup/Config/`) and backend, then stages them as a single IIS site: static frontend files at the site root, backend published under `apiapp/`. The frontend must be built with `VITE_API_BASE_URL=/apiapp` for this layout.
