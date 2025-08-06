// StudentVideosTabs.jsx

import React, { useState } from "react";

export default function StudentVideosTabs({ videos = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!videos.length) {
    return <p>No videos available yet.</p>;
  }

  return (
    <div className="tabs-container">
      {/* Tab bar */}
      <nav className="tabs-nav">
        {videos.map((vid, i) => (
          <button
            key={vid.id || i}
            className={`tab-button${activeIdx === i ? " active" : ""}`}
            onClick={() => setActiveIdx(i)}
          >
            {vid.title || `Video ${i + 1}`}
          </button>
        ))}
      </nav>

      {/* Active video */}
      <div className="tab-panel">
        <video
          controls
          src={videos[activeIdx].url}
          className="video-player"
        />
      </div>
    </div>
  );
}
