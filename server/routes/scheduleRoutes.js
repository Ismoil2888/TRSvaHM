const express = require('express');
const router = express.Router();
const { getSchedule, saveSchedule } = require('../controllers/scheduleController');

router.get('/:course/:group', getSchedule);
router.post('/:course/:group', saveSchedule);

module.exports = router;