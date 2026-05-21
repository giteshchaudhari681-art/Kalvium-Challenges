
const bcrypt = require('bcryptjs');

const users = [
  { id: '1', email: 'reader@example.com', password: '', role: 'reader' },
  { id: '2', email: 'contributor@example.com', password: '', role: 'contributor' },
  { id: '3', email: 'curator@example.com', password: '', role: 'curator' },
  { id: '4', email: 'admin@example.com', password: '', role: 'admin' },
];

// Hash passwords
(async () => {
    const hashed = await bcrypt.hash('password123', 10);
    users.forEach(u => u.password = hashed);
})();

const fragments = [
  { id: '1', content: 'In a world where gravity was just a suggestion...', userId: '4', author: 'admin@example.com', parentId: null, status: 'published', createdAt: new Date() },
];

const blacklist = [];

const pruneBlacklistedTokens = () => {
  const now = Math.floor(Date.now() / 1000);

  for (let index = blacklist.length - 1; index >= 0; index -= 1) {
    if (!blacklist[index].exp || blacklist[index].exp <= now) {
      blacklist.splice(index, 1);
    }
  }
};

const blacklistToken = (token, exp) => {
  pruneBlacklistedTokens();
  blacklist.push({ token, exp });
};

const isTokenBlacklisted = (token) => {
  pruneBlacklistedTokens();
  return blacklist.some((entry) => entry.token === token);
};

module.exports = {
  users,
  fragments,
  blacklist,
  pruneBlacklistedTokens,
  blacklistToken,
  isTokenBlacklisted,
};
