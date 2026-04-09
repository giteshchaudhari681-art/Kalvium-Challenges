import React from "react";

const TaskCount = ({ remaining }) => {
  return (
    <div style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
      {remaining} {remaining === 1 ? "task" : "tasks"} remaining
    </div>
  );
};

export default TaskCount;