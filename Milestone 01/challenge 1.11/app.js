// app.js - entry point
// Responsibility: initialize Express, mount middleware, attach routes,
// and start the server. Nothing else.

// Load environment variables from .env before any other module reads process.env
require('dotenv').config();

const express = require('express');
const confessionRoutes = require('./routes/confessionRoutes');

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Mount confession routes under the versioned API prefix
app.use('/api/v1/confessions', confessionRoutes);

// Read port from the environment so deployment platforms can override it.
const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log(`running on ${PORT}`);
});

module.exports = app;
