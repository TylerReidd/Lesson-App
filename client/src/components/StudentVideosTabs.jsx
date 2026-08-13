export default function StudentVideosTabs({ videos, onDelete, currentUser}) {
  if (!Array.isArray(videos) || videos.length === 0) {
    return <p>No videos available yet.</p>;
  }

  return (
    <div className="video-grid" aria-label="Videos">
      {videos.map((vid, idx) => (
        <article key={vid.id || vid._id || idx} className="video-card">
          <div className="video-card-player">
            <video
              controls
              preload="metadata"
              playsInline
              src={vid.url}
              className="video-player video-player-grid"
            />
          </div>
          <div className="video-card-body">
            <div className="video-card-title">{vid.filename || `Video ${idx + 1}`}</div>
            <p className="video-card-meta">
              Uploaded by {vid.owner === currentUser?.id ? "You" : "Student"}
            </p>
            <p className="video-card-meta">
              {vid.uploadedAt ? new Date(vid.uploadedAt).toLocaleDateString() : "Unknown date"}
            </p>
            {typeof onDelete === 'function' && (
              <button className="button" onClick={() => onDelete(vid.id || vid._id)}>
                Delete Video
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
