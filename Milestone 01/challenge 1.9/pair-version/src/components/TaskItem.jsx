import React from "react";

const TaskItem = ({ task, toggleTask }) => {
  return (
    <div
      onClick={() => toggleTask(task.id)}
      style={{
        padding: "8px",
        marginBottom: "6px",
        cursor: "pointer",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: task.completed ? "#e0e0e0" : "#fff",
        textDecoration: task.completed ? "line-through" : "none",
        color: task.completed ? "#777" : "#000",
      }}
    >
      {task.title}
    </div>
  );
};

export default TaskItem;