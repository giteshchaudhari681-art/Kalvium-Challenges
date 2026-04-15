import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ========== WORKOUTS CRUD ROUTES ==========

// CREATE - POST /workouts - Add a new workout
app.post('/workouts', (req, res) => {
  try {
    const { exercise, weight, reps, date } = req.body;

    // Validate input
    if (!exercise || weight === undefined || !reps || !date) {
      return res.status(400).json({
        error: 'Missing required fields: exercise, weight, reps, date'
      });
    }

    const stmt = 'INSERT INTO workouts (exercise, weight, reps, date) VALUES (?, ?, ?, ?)';
    db.run(stmt, [exercise, weight, reps, date], function(err) {
      if (err) {
        console.error('Error creating workout:', err);
        return res.status(500).json({ error: 'Failed to create workout' });
      }

      db.get('SELECT * FROM workouts WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Error fetching new workout:', err);
          return res.status(500).json({ error: 'Failed to fetch created workout' });
        }

        res.status(201).json({
          success: true,
          data: row,
          message: 'Workout logged successfully'
        });
      });
    });
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
});

// READ - GET /workouts - Get all workouts
app.get('/workouts', (req, res) => {
  try {
    db.all('SELECT * FROM workouts ORDER BY date DESC, createdAt DESC', (err, rows) => {
      if (err) {
        console.error('Error fetching workouts:', err);
        return res.status(500).json({ error: 'Failed to fetch workouts' });
      }

      res.json({
        success: true,
        data: rows || [],
        count: (rows || []).length
      });
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// UPDATE - PUT /workouts/:id - Update a workout
app.put('/workouts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { exercise, weight, reps, date } = req.body;

    // Validate input
    if (!exercise || weight === undefined || !reps || !date) {
      return res.status(400).json({
        error: 'Missing required fields: exercise, weight, reps, date'
      });
    }

    // Check if workout exists
    db.get('SELECT * FROM workouts WHERE id = ?', [id], (err, existing) => {
      if (err) {
        console.error('Error checking workout:', err);
        return res.status(500).json({ error: 'Failed to check workout' });
      }

      if (!existing) {
        return res.status(404).json({ error: 'Workout not found' });
      }

      const updateStmt = 'UPDATE workouts SET exercise = ?, weight = ?, reps = ?, date = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
      db.run(updateStmt, [exercise, weight, reps, date, id], (err) => {
        if (err) {
          console.error('Error updating workout:', err);
          return res.status(500).json({ error: 'Failed to update workout' });
        }

        db.get('SELECT * FROM workouts WHERE id = ?', [id], (err, updated) => {
          if (err) {
            console.error('Error fetching updated workout:', err);
            return res.status(500).json({ error: 'Failed to fetch updated workout' });
          }

          res.json({
            success: true,
            data: updated,
            message: 'Workout updated successfully'
          });
        });
      });
    });
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ error: 'Failed to update workout' });
  }
});

// DELETE - DELETE /workouts/:id - Delete a workout
app.delete('/workouts/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if workout exists
    db.get('SELECT * FROM workouts WHERE id = ?', [id], (err, existing) => {
      if (err) {
        console.error('Error checking workout:', err);
        return res.status(500).json({ error: 'Failed to check workout' });
      }

      if (!existing) {
        return res.status(404).json({ error: 'Workout not found' });
      }

      db.run('DELETE FROM workouts WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Error deleting workout:', err);
          return res.status(500).json({ error: 'Failed to delete workout' });
        }

        res.json({
          success: true,
          message: 'Workout deleted successfully',
          deletedId: id
        });
      });
    });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Gym Tracker Backend running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});
