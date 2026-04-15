import React, { useState, useEffect } from 'react';
import './App.css';
import WorkoutForm from './components/WorkoutForm';
import WorkoutList from './components/WorkoutList';

function App() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  // Fetch workouts on mount
  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/workouts`);
      if (!response.ok) throw new Error('Failed to fetch workouts');
      const result = await response.json();
      setWorkouts(result.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWorkout = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to create workout');
      await fetchWorkouts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkout = async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/workouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to update workout');
      await fetchWorkouts();
      setEditingId(null);
      setEditData(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/workouts/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete workout');
      await fetchWorkouts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (workout) => {
    setEditingId(workout.id);
    setEditData(workout);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>💪 Gym Tracker</h1>
        <p>Never forget your last weight again</p>
      </header>

      <main className="app-main">
        <div className="container">
          {error && <div className="error-banner">{error}</div>}

          <div className="form-section">
            <h2>{editingId ? 'Update Workout' : 'Log a New Set'}</h2>
            {editingId ? (
              <WorkoutForm
                onSubmit={(data) => updateWorkout(editingId, data)}
                onCancel={handleCancelEdit}
                initialData={editData}
                loading={loading}
              />
            ) : (
              <WorkoutForm
                onSubmit={createWorkout}
                loading={loading}
              />
            )}
          </div>

          <div className="list-section">
            <h2>Your Workout History</h2>
            {loading && workouts.length === 0 ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading workouts...</p>
              </div>
            ) : workouts.length === 0 ? (
              <div className="empty-state">
                <p>No workouts logged yet. Start by creating your first entry!</p>
              </div>
            ) : (
              <WorkoutList
                workouts={workouts}
                onEdit={handleEditClick}
                onDelete={deleteWorkout}
                loading={loading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
