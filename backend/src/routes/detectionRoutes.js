const express = require('express');
const router = express.Router();
const detectionController = require('../controllers/detectionController');

router.post('/analyze', detectionController.analyze);
router.get('/suspicious', detectionController.getSuspicious);

module.exports = router;
