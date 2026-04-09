import React, { useState } from "react";

const TaskInput = ({ addTask }) => {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();

    if (!trimmed) return; // prevent empty tasks

    addTask(trimmed);
    setInput(""); // clear input
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <input
        type="text"
        placeholder="Enter a task..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          padding: "8px",
          width: "250px",
          marginRight: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <button
        onClick={handleAdd}
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          border: "1px solid #ccc",
          borderRadius: "4px",
          backgroundColor: "#f5f5f5",
        }}
      >
        Add
      </button>
    </div>
  );
};

export default TaskInput;