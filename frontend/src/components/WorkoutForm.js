import React, { useState, useEffect } from 'react';
import './WorkoutForm.css';

function WorkoutForm({ onSubmit, onCancel, initialData = null, loading = false }) {
  const [formData, setFormData] = useState({
    exercise: '',
    weight: '',
    reps: '',
    date: ''
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        exercise: initialData.exercise,
        weight: initialData.weight,
        reps: initialData.reps,
        date: initialData.date
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.exercise.trim()) {
      setFormError('Exercise name is required');
      return;
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      setFormError('Weight must be a positive number');
      return;
    }
    if (!formData.reps || parseInt(formData.reps) <= 0) {
      setFormError('Reps must be a positive number');
      return;
    }
    if (!formData.date) {
      setFormError('Date is required');
      return;
    }

    onSubmit({
      exercise: formData.exercise.trim(),
      weight: parseFloat(formData.weight),
      reps: parseInt(formData.reps),
      date: formData.date
    });

    // Reset form if not editing
    if (!initialData) {
      setFormData({
        exercise: '',
        weight: '',
        reps: '',
        date: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="workout-form">
      {formError && <div className="form-error">{formError}</div>}

      <div className="form-group">
        <label htmlFor="exercise">Exercise Name *</label>
        <input
          type="text"
          id="exercise"
          name="exercise"
          placeholder="e.g., Bench Press, Squats, Deadlifts"
          value={formData.exercise}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="weight">Weight (kg) *</label>
          <input
            type="number"
            id="weight"
            name="weight"
            placeholder="e.g., 100"
            step="0.5"
            min="0"
            value={formData.weight}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reps">Reps *</label>
          <input
            type="number"
            id="reps"
            name="reps"
            placeholder="e.g., 10"
            min="0"
            value={formData.reps}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Workout' : 'Log Workout'}
        </button>
        {initialData && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default WorkoutForm;
