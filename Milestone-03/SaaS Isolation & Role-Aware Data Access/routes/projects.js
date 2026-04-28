const express = require('express');
const router = express.Router();
const db = require('../db');
const { ROLES, normalizeRole, serializeProject } = require('../lib/accessControl');

function buildProjectScope(actorRole) {
  if (actorRole === ROLES.ADMIN) {
    return {
      clause: '',
      params: []
    };
  }

  if (actorRole === ROLES.MANAGER) {
    return {
      clause: `
        AND (
          p.owner_user_id = $2
          OR EXISTS (
            SELECT 1
            FROM project_assignments pa
            WHERE pa.tenant_id = p.tenant_id
              AND pa.project_id = p.id
              AND pa.user_id = $2
          )
          OR EXISTS (
            SELECT 1
            FROM project_assignments pa
            INNER JOIN users u
              ON u.tenant_id = pa.tenant_id
             AND u.id = pa.user_id
            WHERE pa.tenant_id = p.tenant_id
              AND pa.project_id = p.id
              AND u.manager_id = $2
          )
        )
      `,
      params: []
    };
  }

  return {
    clause: `
      AND EXISTS (
        SELECT 1
        FROM project_assignments pa
        WHERE pa.tenant_id = p.tenant_id
          AND pa.project_id = p.id
          AND pa.user_id = $2
      )
    `,
    params: []
  };
}

// List projects across the entire system
router.get('/', async (req, res) => {
  try {
    const { tenantId, actor } = req.access;
    const actorRole = normalizeRole(actor.role);
    const baseQuery = `
      SELECT p.id, p.name, p.description, p.status, p.budget
      FROM projects p
      WHERE p.tenant_id = $1
    `;

    if (actorRole === ROLES.ADMIN) {
      const { rows } = await db.query(`${baseQuery} ORDER BY p.id`, [tenantId]);
      return res.json(rows.map((row) => serializeProject(row, actorRole)));
    }

    const { clause } = buildProjectScope(actorRole);
    const { rows } = await db.query(`${baseQuery}${clause} ORDER BY p.id`, [tenantId, actor.id]);
    res.json(rows.map((row) => serializeProject(row, actorRole)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to find projects.' });
  }
});

// Specific project details
router.get('/:id', async (req, res) => {
  try {
    const { tenantId, actor } = req.access;
    const actorRole = normalizeRole(actor.role);
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Project id must be a positive integer.' });
    }

    const baseQuery = `
      SELECT p.id, p.name, p.description, p.status, p.budget
      FROM projects p
      WHERE p.tenant_id = $1 AND p.id = $2
    `;

    let queryText = baseQuery;
    let params = [tenantId, id];

    if (actorRole === ROLES.MANAGER) {
      queryText += `
        AND (
          p.owner_user_id = $3
          OR EXISTS (
            SELECT 1
            FROM project_assignments pa
            WHERE pa.tenant_id = p.tenant_id
              AND pa.project_id = p.id
              AND pa.user_id = $3
          )
          OR EXISTS (
            SELECT 1
            FROM project_assignments pa
            INNER JOIN users u
              ON u.tenant_id = pa.tenant_id
             AND u.id = pa.user_id
            WHERE pa.tenant_id = p.tenant_id
              AND pa.project_id = p.id
              AND u.manager_id = $3
          )
        )
      `;
      params.push(actor.id);
    } else if (actorRole === ROLES.USER) {
      queryText += `
        AND EXISTS (
          SELECT 1
          FROM project_assignments pa
          WHERE pa.tenant_id = p.tenant_id
            AND pa.project_id = p.id
            AND pa.user_id = $3
        )
      `;
      params.push(actor.id);
    }

    const { rows } = await db.query(queryText, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    
    res.json(serializeProject(rows[0], actorRole));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve project info.' });
  }
});

module.exports = router;
