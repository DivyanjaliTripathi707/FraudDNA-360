# FraudDNA 360 - Database Documentation

Database Name: `frauddna360`

## Relational Schema Tables
1. `users`: System users and investigators.
2. `accounts`: Bank accounts with status (`ACTIVE`, `MULE_SUSPECT`) and risk score.
3. `locations`: Geographic clusters and region risk scores.
4. `atms`: Physical ATM kiosks linked to locations.
5. `fraud_patterns`: Structuring and transaction velocity rules.
6. `transactions`: Audited transaction ledger.
7. `complaints`: Victim reports.
8. `network_relationships`: Graph edges between accounts and shared attributes.
9. `predictions`: Spatio-temporal AI predictions.
10. `risk_scores`: Historical record of entity risk recalculations.
11. `alerts`: High-priority investigator alerts.
12. `investigations`: Investigator case management records.
