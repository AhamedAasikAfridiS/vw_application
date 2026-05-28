# Auth Service

JWT authentication service for the VW automobile platform.

## Features

- Register and login
- Password hashing with bcrypt-compatible hashing
- JWT access tokens
- Database-backed refresh tokens
- User roles: `user` and `admin`
- Request validation and centralized error handling

## Run Locally

```bash
npm install
npm run dev
```

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /health`
