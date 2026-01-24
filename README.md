# Ironforged Pages

Tile events application at ironforged-events.emuy.gg.

## Features

- Tile event listing and participation
- Progress tracking with screenshot submissions
- Leaderboards
- Admin panel for event management

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Deployed to Cloudflare Pages:

```bash
npm run deploy
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=https://api.emuy.gg
```

## Migrating from yume-pages

This project is split from the original yume-pages EventsApp.
To complete the migration:

1. Copy the TileEvent page component
2. Copy the TileEventAdmin component
3. Copy the guide pages
4. Copy any required utility functions

