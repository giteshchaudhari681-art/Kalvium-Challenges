import React from "react";
import TaskItem from "./TaskItem";

const TaskList = ({ tasks, toggleTask }) => {
  if (tasks.length === 0) {
    return <div style={{ marginTop: "10px" }}>No tasks found.</div>;
  }

  return (
    <div style={{ marginTop: "10px" }}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          toggleTask={toggleTask}
        />
      ))}
    </div>
  );
};

export default TaskList;