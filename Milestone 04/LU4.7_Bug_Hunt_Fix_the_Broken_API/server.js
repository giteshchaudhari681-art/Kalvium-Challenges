// Friday Deploy Disaster - two bugs live in this file.
//
// BUG 05 - CORS middleware is missing entirely.
//   The frontend at http://localhost:5173 will be blocked by the browser
//   with a CORS error on every request. The API works in Postman (not a
//   browser) so the developer assumed it was working. It is not.
//   Fix it
//
// BUG 06 - PORT is hardcoded and the Prisma DB URL is passed inline.
//   Hardcoded values are committed to git history. The database password
//   is now visible to anyone with repo access.
//   Fix it

require('dotenv').config();

const cors = require('cors');
const express = require('express');
const userRouter = require('./src/user.controller');

const app = express();
app.use(express.json());

// BUG 05
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
  })
);

app.use('/users', userRouter);

const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

// BUG 06
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
