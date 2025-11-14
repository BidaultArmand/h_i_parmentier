# Yuka Scanner Service

Standalone Express microservice that replicates the Yuka experience: scan a barcode, enrich the product with OpenFoodFacts data, and compute a transparent nutrition/additive score.

## Quick start
```bash
cd extensions/yuka-scanner-service
cp .env.example .env   # adjust ports/keys if needed
npm install
npm run dev
```

The API will be available at `http://localhost:5080`.

## Environment variables
| Key | Default | Description |
|-----|---------|-------------|
| `SCANNER_PORT` | `5080` | Port for the microservice |
| `OFF_API_BASE` | `https://world.openfoodfacts.org/api/v2` | OFF REST API base |
| `SCANNER_CACHE_TTL` | `3600` | Cache TTL (seconds) for scanned products |

## Endpoints
- `GET /health` – Service status.
- `POST /scan` – Body `{ "barcode": "737628064502" }`, returns score + OFF metadata.
- `GET /scan/:barcode` – Read cached scan results.

## Integration tips
- Once validated, mount the router inside the main backend (`app.use('/api/scanner', scannerRouter)`).
- The frontend can call `POST /scan` and display the returned `score.breakdown` to emulate the Yuka UI.
- Nutrition weights live in `src/scoring/nutritionScore.js` so product experts can tweak the heuristics without touching service code.
