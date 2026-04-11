# Dev Confessions

An anonymous confession app for developers to share their bugs, deadline stress, imposter syndrome, and vibe-coding sessions.

## Live Deployment

> URL will be added after deployment to Render/Railway.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/confessions` | List all confessions (newest first) |
| `POST` | `/api/v1/confessions` | Create a new confession |
| `GET` | `/api/v1/confessions/:id` | Get one confession by ID |
| `GET` | `/api/v1/confessions/category/:cat` | Filter by category |
| `DELETE` | `/api/v1/confessions/:id` | Delete by ID (requires `x-delete-token` header) |

## Valid Categories

`bug`, `deadline`, `imposter`, `vibe-code`

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
PORT=3000
DELETE_SECRET_TOKEN=your_secret_token_here
```

## Run Locally

```bash
npm install
npm start          # production
npm run dev        # development with auto-reload (nodemon)
```

## Project Structure

```
app.js                          # entry point - middleware + server start
routes/
  confessionRoutes.js           # HTTP routes -> controller
controllers/
  confessionController.js       # request/response handling
services/
  confessionService.js          # all business logic + in-memory store
.env.example                    # environment variable template
AUDIT.md                        # pre-refactor audit (Move 1)
CHANGES.md                      # full decision log (Move 7)
```

## Refactor Notes

See [AUDIT.md](./AUDIT.md) for the pre-refactor problem list and [CHANGES.md](./CHANGES.md) for every decision made during the refactor.
