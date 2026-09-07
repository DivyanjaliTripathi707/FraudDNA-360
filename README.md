# FraudDNA 360

> **Proactive Fraud Intelligence and Investigation Platform**  
> Pipeline: **PREVENT → CONNECT → PREDICT → EXPLAIN → RESPOND**

---

## 1. Overview & 5-Layer Architecture

FraudDNA 360 transforms traditional reactive complaint-driven fraud management into a proactive fraud-intelligence platform integrated into ONE system.

The platform combines five core operational layers:

1. **Early Fraud Detection Layer**: Identifies structuring, transaction splitting (e.g. ₹5,00,000 divided into ₹1,00,000, ₹75,000, ₹50,000, ₹40,000), and rapid sequential transfer velocities.
2. **Network & Graph Analysis Layer**: Visualizes multi-hop account topologies, mule networks, shared IP/phone attributes, and physical ATM connections.
3. **AI Predictive Intelligence Layer**: Forecasts **WHERE** (ATM Cluster Hotspots) and **WHEN** (Probable Time Window e.g. 18:00 – 21:00) cash extraction will take place with model confidence scoring.
4. **Dynamic Risk & Explainability Layer**: Recalculates risk scores dynamically upon receiving new complaint or transaction signals (showing `58 → 82 ↑`) with natural language explainability.
5. **Investigation & Response Layer**: Generates high-priority investigator alerts, recommended action leads, and complete case file management.

---

## 2. Technology Stack

- **Frontend**: React.js, Vite, React Router DOM, Axios, Lucide Icons, Tailwind CSS, Recharts.
- **Backend**: Node.js, Express.js, REST APIs, JWT Authentication.
- **Database**: MySQL (`mysql2` connection pool), `schema.sql`, `seed.sql`, plus automatic fallback seed store.

---

## 3. Project Structure

```text
FraudDNA-360/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/            # Login, Dashboard, Detection, Network, Predictions, Risk, Alerts, Investigations
│   │   ├── layouts/          # MainLayout sidebar & topbar shell
│   │   ├── services/         # api.js (Axios REST API service)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── config/           # db.js (MySQL pool & fallback memory store)
│   │   ├── controllers/      # Route handlers for 5 layers & dashboard
│   │   ├── routes/           # Express REST endpoints
│   │   ├── models/           # Relational data access models
│   │   ├── services/         # 5-Layer business logic modules
│   │   ├── middleware/       # Error handling & JWT auth
│   │   ├── app.js
│   │   └── server.js
│   ├── database/
│   │   ├── schema.sql        # MySQL table definitions
│   │   └── seed.sql          # Synthetic demo dataset
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── architecture.md
│   ├── api-documentation.md
│   └── database.md
├── README.md
└── .gitignore
```

---

## 4. Setup Instructions

### Database Setup (MySQL)
1. Ensure MySQL is running on your system.
2. Create database and load schema + seed data:
```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p < backend/database/seed.sql
```

### Backend Installation & Startup
```bash
cd backend
npm install
npm run dev
```
Backend will run on `http://localhost:5000`.

### Frontend Installation & Startup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`.

---

## 5. End-to-End Demo Workflow

1. Open `http://localhost:5173/login` and log in with:
   - **Username**: `admin_investigator`
   - **Password**: `admin123`
2. **Layer 1 (Early Detection)**: Go to `/detection`. Click **Load ₹5,00,000 Structuring Demo** and execute analysis. Observe transaction splitting detection and suspicion score.
3. **Layer 2 (Network Graph)**: Go to `/network`. Inspect connected mule accounts (ACC-44102-MULE-A) and trace 3-hop mule depth.
4. **Layer 3 (AI Predictions)**: Go to `/predictions`. Generate prediction forecast for **ATM Cluster A** (WHERE) and **18:00 - 21:00** (WHEN).
5. **Layer 4 (Dynamic Risk)**: Go to `/risk`. Trigger dynamic risk recalculation and observe score shift (`58 → 82`) with natural language explainability.
6. **Layer 5 (Alerts & Investigations)**: Go to `/alerts` to review high priority investigator leads and update case files in `/investigations`.
