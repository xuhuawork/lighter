const express = require('express');
const router = express.Router();
const lighterController = require('../controllers/lighter.controller');

router.post('/', lighterController.createLighter);
router.get('/:number/history', lighterController.getLighterHistory);
router.get('/:number/usage', lighterController.getUsageCount);

module.exports = router; 