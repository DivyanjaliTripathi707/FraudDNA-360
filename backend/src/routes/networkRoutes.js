const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');

router.get('/graph', networkController.getFullGraph);
router.get('/account/:id', networkController.getAccountNetwork);
router.get('/trace/:id', networkController.traceNetwork);

module.exports = router;
