const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');

router.get('/:id', riskController.getRisk);
router.post('/recalculate', riskController.recalculateRisk);

module.exports = router;
