const db = require('../db');

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

module.exports = async function requestContext(req, res, next) {
  const tenantId = parsePositiveInteger(req.get('x-tenant-id') || req.query.tenant_id);
  const actorUserId = parsePositiveInteger(req.get('x-user-id') || req.query.requester_id);

  if (!tenantId || !actorUserId) {
    return res.status(400).json({
      error: 'Tenant-scoped access requires x-tenant-id and x-user-id headers (or tenant_id and requester_id query params).'
    });
  }

  try {
    const { rows } = await db.query(
      `SELECT id, tenant_id, role, manager_id
       FROM users
       WHERE tenant_id = $1 AND id = $2`,
      [tenantId, actorUserId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Requesting user is not valid for the specified tenant.' });
    }

    req.access = {
      tenantId,
      actor: rows[0]
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to establish request context.' });
  }
};
