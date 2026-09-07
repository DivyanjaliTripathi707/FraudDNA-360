# FraudDNA 360 - REST API Documentation

Base URL: `http://localhost:5000/api`

## Authentication Endpoints
- `POST /api/auth/login`: Authenticate security investigator.
- `POST /api/auth/register`: Register new analyst account.

## Dashboard Endpoint
- `GET /api/dashboard/summary`: Master metrics across all 5 layers.

## Layer 1: Early Detection
- `POST /api/detection/analyze`: Analyze incoming transaction splitting stream.
- `GET /api/detection/suspicious`: Fetch suspicious transaction feed.

## Layer 2: Network & Graph
- `GET /api/network/graph`: Fetch full multi-entity graph nodes & edges.
- `GET /api/network/account/:id`: Fetch 1-hop account neighborhood.
- `GET /api/network/trace/:id?depth=3`: Execute N-hop mule network traversal.

## Layer 3: AI Predictive Intelligence
- `POST /api/prediction/predict`: Generate spatio-temporal hotspot & time window forecast.
- `GET /api/prediction/hotspots`: List high-risk geographic location clusters.

## Layer 4: Dynamic Risk & Explainability
- `GET /api/risk/:id?type=LOCATION`: Retrieve current risk score and history.
- `POST /api/risk/recalculate`: Trigger real-time dynamic risk recalculation.

## Layer 5: Investigation & Response
- `GET /api/alerts`: List active priority investigation alerts.
- `GET /api/alerts/lead/:id`: Generate actionable investigation lead for alert.
- `GET /api/investigations`: List case files.
- `POST /api/investigations`: Create new investigation case.
- `PUT /api/investigations/:id`: Update case status or investigator notes.
