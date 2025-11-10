import React, { useState, useEffect } from "react";

export default function StudentVideosTabs({ videos, onDelete, currentUser}) {
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
    <>
      <nav className="tabs-nav" role='tablist' aria-label="Videos">
        {videos.map((v, i) => (
          <button
            key={v.id || i}
            className={`tab-button ${activeIdx === i ? "active" : ""}`}
            onClick={() => setActiveIdx(i)}
            role="tab"
            aria-selected={activeIdx === i}
            aria-controls={`video-panel-${i}`}
          >
            {v.filename || `Video ${i + 1}`}
          </button>
        ))}
      </nav>
    <div className="tabs-container container">

      {/* Active video */}
      <div id={`video-panel-${idx}`} className="tab-panel">
        <video
          controls
          preload="metadata"
          playsInline
          src={vid.url}
          className="video-player"
        />
        <p>Uploaded by {vid.owner === currentUser?.id ? "You" : "Student"}</p>
        <p>Uploade at: {vid.uploadedAt ? new Date(vid.uploadedAt).toLocaleDateString() : "Unknown"}</p>
        {typeof onDelete === 'function' && (
          <button onClick={() => onDelete(vid.id || vid._id)}>Delete Video</button>
        )}
      </div>
    </div>
    </>
  );
}
