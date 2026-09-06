import { useEffect, useState } from "react";
import axios from "../axios.js";
import CollapsiblePanel from "./CollapsiblePanel.jsx";

export default function StudentPracticeClipLibrary() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClips();
  }, []);

  async function loadClips() {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/practice/me");
      const logs = Array.isArray(data?.logs) ? data.logs : [];
      setClips(
        logs.filter((log) => log.clipUrl && log.savedToLibrary !== false)
      );
    } catch (err) {
      console.error("Failed to load practice clips", err);
      setError(err?.response?.data?.message || "Failed to load clip library.");
    } finally {
      setLoading(false);
    }
  }

  async function removeFromLibrary(logId) {
    try {
      setError("");
      await axios.put(`/practice/${logId}/library`, { savedToLibrary: false });
      setClips((current) => current.filter((clip) => String(clip._id) !== String(logId)));
    } catch (err) {
      console.error("Failed to remove clip from library", err);
      setError(err?.response?.data?.message || "Failed to update clip library.");
    }
  }

  return (
    <CollapsiblePanel title="My clip library" defaultOpen={false}>
      <div className="quiz-assignment-list">
        {error ? <p className="form-note error">{error}</p> : null}
        {loading ? <p className="muted">Loading clips...</p> : null}
        {!loading && clips.length === 0 ? (
          <p className="muted">No saved clips yet.</p>
        ) : null}

        {clips.map((clip) => (
          <article key={clip._id} className="quiz-assignment-card">
            <div className="quiz-library-card-top">
              <div>
                <h2 className="h2">{clip.clipTitle || "Practice clip"}</h2>
                <p className="muted">{clip.focus || "No focus note provided."}</p>
              </div>
              <button
                type="button"
                className="button"
                onClick={() => removeFromLibrary(clip._id)}
              >
                Remove
              </button>
            </div>

            <audio className="practice-clip-player" controls src={clip.clipUrl}>
              Your browser does not support audio playback.
            </audio>

            <div className="quiz-library-meta">
              <span>{new Date(clip.date).toLocaleDateString()}</span>
              {clip.clipDurationSec ? <span>{clip.clipDurationSec}s</span> : null}
              {clip.goal?.title ? <span>Lesson Lab: {clip.goal.title}</span> : null}
              {clip.notes ? <span>{clip.notes}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
