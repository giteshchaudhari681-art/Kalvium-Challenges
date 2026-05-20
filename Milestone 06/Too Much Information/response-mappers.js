export function toAuthUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export function toProfileUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}
