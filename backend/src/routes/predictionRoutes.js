const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

router.post('/predict', predictionController.predict);
router.get('/hotspots', predictionController.getHotspots);

module.exports = router;
