const express = require('express');
const router = express.Router();
const guard = require('../middlewares/guard_middleware');
const {
  sendMessageController,
  listSessionsController,
  getSessionController,
  deleteSessionController,
  renameSessionController,
  createSessionController
} = require('../controllers/session_controller');

router.post('/', guard, createSessionController); 
router.post('/:id/messages', guard, sendMessageController)
router.get('/', guard, listSessionsController);
router.get('/:id', guard, getSessionController);
router.delete('/:id', guard, deleteSessionController);
router.patch('/:id/title', guard, renameSessionController);

module.exports = router;