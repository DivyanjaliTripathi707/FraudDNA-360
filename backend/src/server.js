const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` FraudDNA 360 - Proactive Fraud Intelligence Platform`);
  console.log(` Pipeline: PREVENT → CONNECT → PREDICT → EXPLAIN → RESPOND`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(`====================================================`);
});
