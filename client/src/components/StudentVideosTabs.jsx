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
// import React, { useState, useEffect } from "react";

// export default function StudentVideosTabs({ videos, onDelete, currentUser }) {
//   const [activeIdx, setActiveIdx] = useState(0);

//   useEffect(() => {
//     if (Array.isArray(videos) && videos.length > 0 && activeIdx >= videos.length) {
//       setActiveIdx(videos.length - 1);
//     }
//   }, [videos, activeIdx]);

//   if (!Array.isArray(videos) || videos.length === 0) {
//     return <p>No videos available yet.</p>;
//   }

//   const idx = Math.min(activeIdx, videos.length - 1);
//   const vid = videos[idx] || {};
//   const userId = currentUser?.id || currentUser?._id || null;
//   const isTeacher = currentUser?.role === "teacher";
//   const isOwner = !!(userId && vid.owner && String(vid.owner) === String(userId));
//   const isRecipient = !!(userId && vid.recipient && String(vid.recipient) === String(userId));
//   const canDelete = Boolean(isTeacher || isOwner || isRecipient);

//   if (!vid || !vid.url) return <p>Loading video...</p>;

//   return (
//     <div className="tabs-container">
//       <nav className="tabs-nav">
//         {videos.map((v, i) => (
//           <button
//             key={v.id || v._id || i}
//             className={`tab-button ${activeIdx === i ? "active" : ""}`}
//             onClick={() => setActiveIdx(i)}
//           >
//             {v.filename || `Video ${i + 1}`}
//           </button>
//         ))}
//       </nav>

//       <div className="tab-panel">
//         <video controls preload="metadata" playsInline src={vid.url} className="video-player" />
//         <p>Uploaded: {vid.uploadedAt ? new Date(vid.uploadedAt).toLocaleDateString() : "Unknown"}</p>

//         {/* 👇 Debug: show exactly why canDelete is false */}
//         <pre style={{ fontSize: 12, opacity: 0.7, background: "#f6f6f6", padding: 8, borderRadius: 6 }}>
// {JSON.stringify({
//   me: { id: userId, role: currentUser?.role },
//   vid: { id: vid.id || vid._id, owner: vid.owner, recipient: vid.recipient },
//   checks: { isTeacher, isOwner, isRecipient, canDelete }
// }, null, 2)}
//         </pre>

//         {canDelete && (
//           <button onClick={() => onDelete(vid.id || vid._id)}>Delete Video</button>
//         )}
//       </div>
//     </div>
//   );
// }
