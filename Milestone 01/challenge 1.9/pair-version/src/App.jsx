import React, { useState } from "react";
import "./App.css";

import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";
import FilterButtons from "./components/FilterButtons";
import TaskCount from "./components/TaskCount";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  // Add task
  const addTask = (title) => {
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  // Toggle task
  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  // Remaining count
  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <div className="app-container">
      <h1 className="app-title">Task Manager</h1>

      <TaskInput addTask={addTask} />

      <FilterButtons
        currentFilter={filter}
        setFilter={setFilter}
      />

      <TaskList
        tasks={filteredTasks}
        toggleTask={toggleTask}
      />

      <TaskCount remaining={remaining} />
    </div>
  );
};

export default App;