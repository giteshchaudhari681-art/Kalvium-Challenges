// confessionController.js
// Extracts request data, calls the service layer, and sends HTTP responses.
// No business logic lives here; it stays in confessionService.js.

const confessionService = require('../services/confessionService');

/**
 * createConfession
 * POST /api/v1/confessions
 * Validates input via the service, then persists and returns the new record.
 */
function createConfession(req, res) {
  const confessionData = req.body;

  // The service returns both the payload and whether it should be JSON or plain text.
  const validationError = confessionService.validateConfessionInput(confessionData);
  if (validationError) {
    if (validationError.type === 'send') {
      return res.status(validationError.status).send(validationError.body);
    }

    return res.status(validationError.status).json(validationError.body);
  }

  const newConfession = confessionService.saveConfession(confessionData);
  return res.status(201).json(newConfession);
}

/**
 * listAllConfessions
 * GET /api/v1/confessions
 * Returns all confessions sorted newest-first with a count.
 */
function listAllConfessions(req, res) {
  const confessionList = confessionService.getAllConfessions();
  return res.json(confessionList);
}

/**
 * getConfessionById
 * GET /api/v1/confessions/:id
 * Returns a single confession by numeric ID, or 404 if not found.
 */
function getConfessionById(req, res) {
  // URL params arrive as strings, so parse once at the boundary.
  const confessionId = parseInt(req.params.id, 10);
  const confession = confessionService.getConfessionById(confessionId);

  // Keep the original plain-text 500 response for corrupt records.
  if (confession === undefined) {
    return res.status(500).send('broken');
  }

  if (confession === null) {
    return res.status(404).json({ msg: 'not found' });
  }

  return res.json(confession);
}

/**
 * getConfessionsByCategory
 * GET /api/v1/confessions/category/:cat
 * Returns all confessions in a given category, newest-first.
 */
function getConfessionsByCategory(req, res) {
  const category = req.params.cat;
  const filteredConfessions = confessionService.getConfessionsByCategory(category);

  if (filteredConfessions === null) {
    return res.status(400).json({ msg: 'invalid category' });
  }

  return res.json(filteredConfessions);
}

/**
 * deleteConfession
 * DELETE /api/v1/confessions/:id
 * Verifies the delete token, then removes the confession by ID.
 * The secret token is read from environment variables so deployments can manage it safely.
 */
function deleteConfession(req, res) {
  // Secrets belong in environment variables, not source control.
  if (req.headers['x-delete-token'] !== process.env.DELETE_SECRET_TOKEN) {
    return res.status(403).json({ msg: 'no permission' });
  }

  const confessionId = parseInt(req.params.id, 10);

  // Preserve the original plain-text response for invalid or missing IDs.
  if (!req.params.id || isNaN(confessionId)) {
    return res.status(400).send('no id');
  }

  const deletedConfession = confessionService.deleteConfessionById(confessionId);

  if (!deletedConfession) {
    return res.status(404).json({ msg: 'not found buddy' });
  }

  return res.json({ msg: 'ok', item: deletedConfession });
}

module.exports = {
  createConfession,
  listAllConfessions,
  getConfessionById,
  getConfessionsByCategory,
  deleteConfession,
};
