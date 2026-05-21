
const express = require('express');
const router = express.Router();
const { fragments, users } = require('../data/store');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const csrfProtection = require('../middleware/csrf');

const MODERATOR_ROLES = ['curator', 'admin'];

const findFragment = (fragmentId) => fragments.find((fragment) => fragment.id === fragmentId);

router.get('/', (req, res) => {
  res.json(fragments);
});

router.post('/', auth, csrfProtection, roleCheck(['contributor', 'curator', 'admin']), (req, res) => {
  const { content, parentId } = req.body;
  const isModerator = MODERATOR_ROLES.includes(req.user.role);
  const newFrag = {
    id: Date.now().toString(),
    content,
    parentId,
    userId: req.user.id,
    author: users.find((u) => u.id === req.user.id)?.email,
    status: isModerator ? 'published' : 'pending',
    createdAt: new Date()
  };
  fragments.push(newFrag);
  res.status(201).json(newFrag);
});

router.put('/:id', auth, csrfProtection, roleCheck(['contributor', 'curator', 'admin']), (req, res) => {
  const frag = findFragment(req.params.id);
  if(!frag) return res.status(404).json({ error: 'Fragment not found' });

  const isOwner = frag.userId === req.user.id;
  const isModerator = MODERATOR_ROLES.includes(req.user.role);

  if (!isModerator && !isOwner) {
    return res.status(403).json({ error: 'You can only edit your own fragments' });
  }

  frag.content = req.body.content;
  res.json(frag);
});

router.post('/:id/approve', auth, csrfProtection, roleCheck(MODERATOR_ROLES), (req, res) => {
  const frag = findFragment(req.params.id);
  if(!frag) return res.status(404).json({ error: 'Fragment not found' });
  frag.status = 'published';
  res.json(frag);
});

router.delete('/:id', auth, csrfProtection, roleCheck(['admin']), (req, res) => {
  const index = fragments.findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  fragments.splice(index, 1);
  res.json({ message: 'Deleted' });
});

module.exports = router;
