import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    axios.get("/resources/assignments/student")
      .then(res => setAssignments(res.data))
      .catch(err => console.error("Failed to fetch assignments", err));
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>My Assignments</h1>
        <ul className="video-list">
          {assignments.map(a => (
            <li key={a._id}>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="video-title"
              >
                {a.filename}
              </a>
              <span className="text-sm text-gray-500 ml-2">
                {new Date(a.uploadedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}