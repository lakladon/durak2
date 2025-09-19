# Durak game

A multiplayer Durak card game using Socket.IO and Express.

## Authentication & Security

This project now includes:
- JWT authentication with registration and login
- Password hashing with bcrypt
- Socket.IO connection authentication via token
- Basic security middleware: Helmet, CORS, and rate limiting
- Player statistics persisted to `data/stats.json`

### Environment variables

Create a `.env` (or set env vars) for production:

```
JWT_SECRET=replace-with-a-strong-secret
PORT=3000
```

For local development, a fallback secret is used but you should set `JWT_SECRET`.

### API

- `POST /api/auth/register` { username, password } → { token, user }
- `POST /api/auth/login` { username, password } → { token, user }
- `GET /api/me` (Bearer token) → { user }
- `GET /api/stats/me` (Bearer token) → { stats }

Socket.IO connects with:

```js
io({ auth: { token: '<JWT>' } })
```

### Data persistence

JSON files are stored under `data/`:
- `data/users.json`
- `data/stats.json`

Do not commit secrets or user data in production.