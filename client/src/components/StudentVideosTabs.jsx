// StudentVideosTabs.jsx

import React, { useState, useEffect } from "react";

export default function StudentVideosTabs({ videos, onDelete}) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (Array.isArray(videos) && videos.length > 0 && activeIdx >= videos.length) {
      setActiveIdx(videos.length - 1)
  }
}, [videos, activeIdx])

  if (!Array.isArray(videos) || videos.length === 0) {
    return <p>No videos available yet.</p>;
  }

  const idx = Math.min(activeIdx, videos.length - 1)
  const vid = videos[idx] || {}

  if(!vid || !vid.url) {
    return <p>Loading video...</p>
  }

  return (
    <div className="tabs-container">
      {/* Tab bar */}
      <nav className="tabs-nav">
        {videos.map((v, i) => (
          <button
            key={v.id || i}
            className={`tab-button ${activeIdx === i ? "active" : ""}`}
            onClick={() => setActiveIdx(i)}
          >
            {v.filename || `Video ${i + 1}`}
          </button>
        ))}
      </nav>

      {/* Active video */}
      <div className="tab-panel">
        <video
          controls
          preload="metadata"
          playsInline
          src={vid.url}
          className="video-player"
        />
        <p>Uploaded: {vid.uploadedAt ? new Date(vid.uploadedAt).toLocaleDateString() : "Unknown"}</p>
        <button onClick={() => onDelete(vid.id || vid._id)}>Delete Video</button>
      </div>
    </div>
  );
}
