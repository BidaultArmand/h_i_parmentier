# Yuka-like Scanner Feature

## Vision
Provide a grocery scanning experience similar to Yuka: scan a product barcode in-store, fetch detailed nutrition/allergen/additive data, and return a transparent score that helps the shopper decide whether the item is a “good product”.

The feature runs as an optional microservice so we can develop it without modifying existing backend/frontend files. Once validated, routes/components can be wired into the main apps.

## High-level Flow
1. **Scan** – Users scan a barcode (EAN/UPC) from the mobile/web client.
2. **Lookup** – The new Scanner API queries OpenFoodFacts (OFF) for the product profile, caching results to avoid repeated calls.
3. **Score** – Business logic transforms OFF nutrients & additives into a `0–100` score plus textual breakdown.
4. **Respond** – Client receives the score, risk flags, ingredients, and suggestions for healthier alternatives.

## Microservice Overview
- Location: `extensions/yuka-scanner-service`
- Stack: Node.js + Express + node-fetch (pure ESM to match the main backend).
- Endpoints:
  - `POST /scan` – Takes `{ barcode: string }`, returns score + product info.
  - `GET /scan/:barcode` – Idempotent fetch for stored scans.
  - `GET /health` – Basic healthcheck for monitoring.
- Storage: in-memory LRU cache (can swap to Redis later).
- Environment:
  - `OFF_API_BASE=https://world.openfoodfacts.org/api/v2`
  - `SCANNER_PORT=5080`
  - Optional `SCANNER_CACHE_TTL=3600` seconds.

## Scoring Model (v1)
The initial heuristic mirrors public information on Yuka:

| Block | Weight | Details |
|-------|--------|---------|
| Nutritional quality | 60% | Based on Nutri-Score style computation using energy, sugars, saturated fat, sodium, fiber, fruits/veggies. |
| Additives | 30% | Penalize additives flagged as “to avoid” or limited evidence. |
| Organic labels | 5% bonus | `+5` if organic certification present. |
| Allergens warning | 5% penalty | `-5` if allergens include top-14 list. |

Final score clamps between 0 and 100 and yields human-grade: **Excellent** (90+), **Good** (70–89), **Average** (50–69), **Poor** (0–49).

## Integration Plan
1. **Backend** – Once reviewed, expose the scanner routes by importing the microservice router into `backend/src/app.js`. This keeps the main API untouched for now.
2. **Frontend** – Create a new page/component that:
   - Uses `navigator.mediaDevices.getUserMedia` or manual barcode input.
   - Calls the scanner endpoint and renders the score gauge + details.
3. **State Sharing** – Optional hook to push scored products into existing baskets via `/api/basket`.

## Testing Strategy
- Unit tests: scoring utilities with fixture OFF responses.
- Integration: supertest hitting `/scan` with mocked fetch.
- Manual: run `npm run dev` inside the new microservice and query via `curl` or Postman.

## Next Steps
- Implement the microservice (see `extensions/yuka-scanner-service`).
- Prototype a lightweight frontend view (e.g., `extensions/yuka-scanner-ui`) before wiring it into the production frontend.
- Collect feedback on scoring weights and adjust before GA.
