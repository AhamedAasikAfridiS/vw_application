# Profile Service

Protected profile service for the VW automobile platform.

## Features

- User profile APIs
- Saved vehicle APIs
- User preference APIs
- JWT verification middleware
- PostgreSQL persistence

## Run Locally

```bash
npm install
npm run dev
```

## API

- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /api/profile/saved-vehicles`
- `POST /api/profile/saved-vehicles`
- `DELETE /api/profile/saved-vehicles/:vehicleId`
- `GET /api/profile/preferences`
- `PUT /api/profile/preferences`
- `GET /health`
