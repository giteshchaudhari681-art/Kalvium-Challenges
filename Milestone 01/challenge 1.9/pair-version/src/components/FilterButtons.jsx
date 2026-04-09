import React from "react";

const FilterButtons = ({ currentFilter, setFilter }) => {
  const filters = ["all", "active", "completed"];

  return (
    <div style={{ marginTop: "10px" }}>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setFilter(filter)}
          style={{
            marginRight: "8px",
            padding: "6px 12px",
            cursor: "pointer",
            fontWeight: currentFilter === filter ? "bold" : "normal",
            backgroundColor:
              currentFilter === filter ? "#ddd" : "#f5f5f5",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;