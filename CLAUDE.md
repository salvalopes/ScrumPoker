# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

### Backend (`backend/`)
```bash
dotnet run                        # API em http://localhost:5078
dotnet build
dotnet publish -c Release -o out
```

### Frontend (`frontend/`)
```bash
npm run dev    # Dev server em localhost:5173 (proxy automático para API)
npm run build  # Type-check + Vite build
```

### Docker (stack completa)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
# API exposta em localhost:5078; frontend em localhost:5173
```

### Deploy — fluxo normal
```bash
git commit -m "..."
git push   # GitHub Actions trata do resto (build GHCR + deploy SSH)
```

Deploy manual (só para debugging):
```bash
docker buildx build --platform linux/amd64,linux/arm64 \
  -f backend/Dockerfile -t ghcr.io/salvalopes/scrumpoker-api:latest --push .

docker buildx build --platform linux/amd64,linux/arm64 \
  -f frontend/Dockerfile -t ghcr.io/salvalopes/scrumpoker-frontend:latest --push ./frontend

ssh deploy@178.105.35.70
cd /home/deploy/scrumpoker
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Arquitectura

### Estado em memória — sem base de dados

`PokerRoomService` é um **Singleton thread-safe** (usa `lock`) que mantém toda a sala em memória. Não há persistência — reiniciar o processo limpa a sala. Só pode correr uma instância de backend (sem horizontal scaling).

Modelo interno:
```
PokerRoomState
  ├── List<PokerParticipant> Participants
  └── bool AreVotesRevealed

PokerParticipant: ConnectionId, DisplayName, int? Vote
```

### Fluxo SignalR

O único endpoint REST (`GET /api/room/{roomId}/state`) é chamado pelo frontend **antes** da ligação SignalR arrancar — serve para preencher o estado inicial sem esperar pelo handshake. Devolve estado vazio (`[]`, `false`) se a sala ainda não existir (não devolve 404).

Cada acção mutante chama o serviço, depois faz broadcast de `RoomStateDto` para o grupo da sala via `Clients.Group(roomId).SendAsync("RoomStateUpdated", ...)`. `PokerHub` é uma thin wrapper sobre `PokerRoomService` — não contém lógica.

O `roomId` da ligação é guardado em `Context.Items["roomId"]` no `JoinRoom` e recuperado em `OnDisconnectedAsync` para saber de que sala remover o participante (sem precisar de mapeamento externo).

Votos válidos (whitelist): `[1, 2, 3, 5, 8, 13, 20, 40, 100]`

`roomId`: apenas `[a-z0-9]`, máx. 20 chars. Validado no hub, no controller e no serviço. Sala criada na primeira vez que alguém entra (`GetOrCreateRoom`); removida do dicionário quando o último participante sai (evita leak de memória).

Comportamento importante em `CreateRoomStateDto()`:
- `ParticipantDto.Vote` é sempre `null` enquanto `AreVotesRevealed == false` (oculta votos dos outros)
- `HasVoted` é `true` independentemente do reveal
- Participantes ordenados alfabeticamente (case-insensitive) — ordem determinística

### Frontend — hook central

`usePokerHub` é o único ponto de gestão do SignalR. Fluxo de inicialização:
1. `GET /api/room/state` → preenche estado antes de conectar
2. `HubConnectionBuilder` com auto-reconnect
3. Ao conectar: invoca `JoinRoom(roomId, displayName)`
4. Listener `RoomStateUpdated` → actualiza `roomState` + limpa `selectedVote` se o utilizador já não votou

Na reconexão automática, re-invoca `JoinRoom(roomId, displayName)`. `useEffect` depende de `[roomId, normalizedDisplayName]` — muda de sala sem recarregar a página.

`useRoomId` gere o cookie `roomId` (30 dias). Exporta `generateRoomId()` com `crypto.getRandomValues`, 10 chars `[a-z0-9]`. O `roomId` do URL tem sempre prioridade sobre o cookie — `RoomPage` chama `setRoomId(roomId)` ao montar para garantir que links partilhados actualizam o cookie.

`useDisplayName` gere o cookie `displayName` (30 dias, SameSite=Lax, Secure em HTTPS). Normaliza sempre: trim + colapsa espaços múltiplos, max 30 chars.

`appConfig` lê `VITE_API_BASE_URL` e `VITE_HUB_URL`. **Deixar vazias em produção Docker** — o Nginx do frontend faz proxy de `/api` e `/hubs` para `api:8080` internamente.

### Proxy em produção (Nginx)

O Caddy só fala com o container frontend (porta 8082). O Nginx do frontend faz proxy interno:
- `/api/` → `http://api:8080` (HTTP)
- `/hubs/` → `http://api:8080` com WebSocket upgrade (`proxy_http_version 1.1`, `Upgrade`, `Connection`, `proxy_read_timeout 86400`)

`resolver 127.0.0.11` é **obrigatório** no nginx.conf para resolver o hostname `api` em runtime dentro da rede Docker — sem isto o Nginx falha ao arrancar se o container `api` ainda não existir.

### CORS

`Cors:AllowedOrigins` vazio → `AllowAnyOrigin` (sem `AllowCredentials`).  
Preenchido → `WithOrigins(...) + AllowCredentials`.  
Em produção, `Cors__AllowedOrigins__0=https://poker.salv4.com` (formato .NET com `__` para hierarquia de configuração).

### Variáveis de ambiente em produção

```
ASPNETCORE_ENVIRONMENT=Production
CORS_ORIGIN=https://poker.salv4.com
FRONTEND_PORT=127.0.0.1:8082
```
