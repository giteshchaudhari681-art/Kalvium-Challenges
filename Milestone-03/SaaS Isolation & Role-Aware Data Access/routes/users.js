const express = require('express');
const router = express.Router();
const db = require('../db');
const { ROLES, normalizeRole, serializeUser } = require('../lib/accessControl');

function buildUserAccessCondition(actorRole, baseParamIndex) {
  if (actorRole === ROLES.ADMIN) {
    return {
      clause: '',
      params: []
    };
  }

  if (actorRole === ROLES.MANAGER) {
    return {
      clause: ` AND (id = $${baseParamIndex} OR manager_id = $${baseParamIndex})`,
      params: []
    };
  }

  return {
    clause: ` AND id = $${baseParamIndex}`,
    params: []
  };
}

// List all users for the workforce manager
router.get('/', async (req, res) => {
  try {
    const { tenantId, actor } = req.access;
    const actorRole = normalizeRole(actor.role);
    const baseQuery = `
      SELECT id, full_name, email, role, salary
      FROM users
      WHERE tenant_id = $1
    `;

    if (actorRole === ROLES.ADMIN) {
      const { rows } = await db.query(`${baseQuery} ORDER BY id`, [tenantId]);
      return res.json(rows.map((row) => serializeUser(row, actorRole)));
    }

    const { clause } = buildUserAccessCondition(actorRole, 2);
    const { rows } = await db.query(`${baseQuery}${clause} ORDER BY id`, [tenantId, actor.id]);
    res.json(rows.map((row) => serializeUser(row, actorRole)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// Single user profile view
router.get('/:id', async (req, res) => {
  try {
    const { tenantId, actor } = req.access;
    const actorRole = normalizeRole(actor.role);
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'User id must be a positive integer.' });
    }

    const baseQuery = `
      SELECT id, full_name, email, role, salary
      FROM users
      WHERE tenant_id = $1 AND id = $2
    `;

    let queryText = baseQuery;
    let params = [tenantId, id];

    if (actorRole === ROLES.MANAGER) {
      queryText += ' AND (id = $3 OR manager_id = $3)';
      params.push(actor.id);
    } else if (actorRole === ROLES.USER) {
      queryText += ' AND id = $3';
      params.push(actor.id);
    }

    const { rows } = await db.query(queryText, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json(serializeUser(rows[0], actorRole));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to find user.' });
  }
});

module.exports = router;
