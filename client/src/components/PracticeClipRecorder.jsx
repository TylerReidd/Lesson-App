import { useEffect, useRef, useState } from "react";
import axios from "../axios.js";
import CollapsiblePanel from "./CollapsiblePanel.jsx";

const MAX_SECONDS = 60;

function pickMimeType() {
  const preferred = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];
  return preferred.find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || "";
}

export default function PracticeClipRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [clipTitle, setClipTitle] = useState("");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [savedToLibrary, setSavedToLibrary] = useState(true);
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const intervalRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      mediaStreamRef.current?.getTracks?.().forEach((track) => track.stop());
    };
  }, [audioUrl]);

  async function loadGoals() {
    try {
      const { data } = await axios.get("/goals/student");
      setGoals(
        Array.isArray(data?.goals)
          ? data.goals.filter((goal) => goal.status !== "completed")
          : []
      );
    } catch (err) {
      console.error("Failed to load lesson lab items for practice clip", err);
      setGoals([]);
    }
  }

  async function startRecording() {
    try {
      setError("");
      setMessage("");
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }
      setAudioBlob(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const nextBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const nextUrl = URL.createObjectURL(nextBlob);
        setAudioBlob(nextBlob);
        setAudioUrl(nextUrl);
        mediaStreamRef.current?.getTracks?.().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      };

      recorder.start();
      setElapsed(0);
      setIsRecording(true);
      intervalRef.current = window.setInterval(() => {
        setElapsed((current) => {
          if (current >= MAX_SECONDS - 1) {
            stopRecording();
            return MAX_SECONDS;
          }
          return current + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Failed to start audio recording", err);
      setError("Microphone access is required to record a clip.");
    }
  }

  function stopRecording() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  function resetClip() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl("");
    setElapsed(0);
    setMessage("");
    setError("");
  }

  async function submitClip(event) {
    event.preventDefault();
    if (!audioBlob) {
      setError("Record a clip first.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      const extension = audioBlob.type.includes("mp4") ? "m4a" : "webm";
      const file = new File([audioBlob], `practice-clip.${extension}`, {
        type: audioBlob.type || "audio/webm",
      });
      const formData = new FormData();
      formData.append("clip", file);
      formData.append("clipTitle", clipTitle);
      formData.append("focus", focus);
      formData.append("notes", notes);
      formData.append("goalId", selectedGoalId);
      formData.append("clipDurationSec", String(Math.min(elapsed || MAX_SECONDS, MAX_SECONDS)));
      formData.append("savedToLibrary", String(savedToLibrary));

      await axios.post("/practice/clip", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setClipTitle("");
      setFocus("");
      setNotes("");
      setSavedToLibrary(true);
      setSelectedGoalId("");
      resetClip();
      setMessage("Practice clip submitted.");
    } catch (err) {
      console.error("Failed to submit practice clip", err);
      setError(err?.response?.data?.message || "Failed to submit practice clip.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CollapsiblePanel title="Quick practice capture" defaultOpen={false}>
      <div>
        <form className="quiz-composer-form" onSubmit={submitClip}>
          <p className="muted">
            Record up to 60 seconds, listen back, and send it straight to your teacher.
          </p>

          <div className="practice-clip-recorder">
            <div className={`practice-clip-meter ${isRecording ? "recording" : ""}`}>
              <span className="practice-clip-dot" />
              <span>{isRecording ? "Recording" : "Ready"}</span>
              <strong>{elapsed}s / {MAX_SECONDS}s</strong>
            </div>

            <div className="practice-clip-actions">
              {!isRecording ? (
                <button type="button" className="button-primary" onClick={startRecording}>
                  {audioBlob ? "Record Again" : "Start Recording"}
                </button>
              ) : (
                <button type="button" className="button-primary" onClick={stopRecording}>
                  Stop Recording
                </button>
              )}

              {audioBlob ? (
                <button type="button" className="button" onClick={resetClip}>
                  Clear Clip
                </button>
              ) : null}
            </div>
          </div>

          {audioUrl ? (
            <audio className="practice-clip-player" controls src={audioUrl}>
              Your browser does not support audio playback.
            </audio>
          ) : null}

          <div className="grid grid-sm-2">
            <label className="field">
              <span>Clip title</span>
              <input
                className="input"
                value={clipTitle}
                onChange={(event) => setClipTitle(event.target.value)}
                placeholder="Scale run-through"
              />
            </label>

          <label className="field">
            <span>What were you working on?</span>
            <input
                className="input"
                value={focus}
                onChange={(event) => setFocus(event.target.value)}
                placeholder="Left-hand timing, chord changes, intonation..."
              />
            </label>
          </div>

          <label className="field">
            <span>Link to lesson lab</span>
            <select
              className="input"
              value={selectedGoalId}
              onChange={(event) => setSelectedGoalId(event.target.value)}
            >
              <option value="">No linked lesson lab</option>
              {goals.map((goal) => (
                <option key={goal._id} value={goal._id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Notes for your teacher</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What should they listen for?"
            />
          </label>

          <label className="practice-clip-toggle">
            <input
              type="checkbox"
              checked={savedToLibrary}
              onChange={(event) => setSavedToLibrary(event.target.checked)}
            />
            <span>Save a copy in my clip library</span>
          </label>

          {error ? <p className="form-note error">{error}</p> : null}
          {message ? <p className="form-note success">{message}</p> : null}

          <div className="actions">
            <button
              type="submit"
              className="button-primary"
              disabled={!audioBlob || submitting || isRecording}
            >
              {submitting ? "Submitting..." : "Send Practice Clip"}
            </button>
          </div>
        </form>
      </div>
    </CollapsiblePanel>
  );
}
