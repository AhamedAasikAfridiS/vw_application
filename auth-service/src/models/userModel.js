const USER_ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin"
});

function toPublicUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

module.exports = { USER_ROLES, toPublicUser };
