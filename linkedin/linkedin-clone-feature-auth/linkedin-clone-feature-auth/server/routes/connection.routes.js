const express = require('express');
const router = express.Router();
const {
  sendRequest,
  acceptRequest,
  getConnections,
  getPendingRequests
} = require('../controllers/connection.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/:id/request', protect, sendRequest);
router.put('/:id/accept', protect, acceptRequest);
router.get('/', protect, getConnections);
router.get('/pending', protect, getPendingRequests);

module.exports = router;