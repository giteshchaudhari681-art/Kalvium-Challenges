// confessionRoutes.js
// Receives HTTP requests and immediately delegates to the controller.
// Routes stay thin so Express path wiring is isolated from business logic.

const express = require('express');
const router = express.Router();
const confessionController = require('../controllers/confessionController');

// Register the category route before /:id so Express does not treat "category" as an ID.
router.get('/category/:cat', confessionController.getConfessionsByCategory);

router.post('/', confessionController.createConfession);
router.get('/', confessionController.listAllConfessions);
router.get('/:id', confessionController.getConfessionById);
router.delete('/:id', confessionController.deleteConfession);

module.exports = router;
