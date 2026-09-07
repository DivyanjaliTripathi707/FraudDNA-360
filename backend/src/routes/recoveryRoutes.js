const express = require('express');
const router = express.Router();
const recoveryCtrl = require('../controllers/recoveryController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Layer 6: RECOVER
router.get('/', recoveryCtrl.getAllCases);
router.get('/:ref', recoveryCtrl.getCaseByRef);
router.post('/verify', recoveryCtrl.verifyTransaction);
router.put('/:ref/status', authenticate, authorizeRoles('Investigator', 'Admin'), recoveryCtrl.updateStatus);

module.exports = router;
