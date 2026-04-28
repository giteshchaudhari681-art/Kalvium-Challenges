const ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
});

function normalizeRole(role) {
  return role === 'employee' ? ROLES.USER : role;
}

function serializeUser(row, actorRole) {
  const safeUser = {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: normalizeRole(row.role)
  };

  if (actorRole === ROLES.ADMIN) {
    safeUser.salary = row.salary;
  }

  return safeUser;
}

function serializeProject(row, actorRole) {
  const safeProject = {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status
  };

  if (actorRole === ROLES.ADMIN) {
    safeProject.budget = row.budget;
  }

  return safeProject;
}

module.exports = {
  ROLES,
  normalizeRole,
  serializeProject,
  serializeUser
};
