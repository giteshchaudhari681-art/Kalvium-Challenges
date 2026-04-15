import React from 'react';
import './WorkoutList.css';

function WorkoutList({ workouts, onEdit, onDelete, loading }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="workout-list">
      <div className="list-stats">
        <span className="stat">Total Workouts: <strong>{workouts.length}</strong></span>
      </div>

      <div className="table-wrapper">
        <table className="workouts-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Weight (kg)</th>
              <th>Reps</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map(workout => (
              <tr key={workout.id} className="workout-row">
                <td className="exercise-name">{workout.exercise}</td>
                <td className="weight">{workout.weight}</td>
                <td className="reps">{workout.reps}</td>
                <td className="date">{formatDate(workout.date)}</td>
                <td className="actions">
                  <button
                    onClick={() => onEdit(workout)}
                    className="btn-action btn-edit"
                    disabled={loading}
                    title="Edit this workout"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => onDelete(workout.id)}
                    className="btn-action btn-delete"
                    disabled={loading}
                    title="Delete this workout"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WorkoutList;
