const express = require('express');
const app = express();
const usersRouter = require('./routes/users');
const projectsRouter = require('./routes/projects');
const requestContext = require('./middleware/requestContext');

// JSON parsing middleware
app.use(express.json());

// Main entry route
app.get('/', (req, res) => {
  res.json({
    name: 'CorpFlow SaaS API',
    version: '2.0.0-secure',
    status: 'online',
    message: 'Welcome to the CorpFlow tenant-aware workforce management API.'
  });
});

// Register routers
app.use(['/users', '/projects'], requestContext);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 CorpFlow SaaS API Running on port ${PORT}`);
  console.log('------------------------------------------');
  console.log(`Root:     http://localhost:${PORT}/`);
  console.log(`Users:    http://localhost:${PORT}/users`);
  console.log(`Projects: http://localhost:${PORT}/projects\n`);
});
