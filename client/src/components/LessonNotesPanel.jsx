import { useEffect, useState } from "react";
import axios from "../axios.js";

const EMPTY_FORM = { title: "", content: "" };

export default function LessonNotesPanel({ studentId }) {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    loadNotes(studentId);
  }, [studentId]);

  async function loadNotes(id) {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`/teacher/students/${id}/notes`, {
        withCredentials: true,
      });
      setNotes(Array.isArray(data?.notes) ? data.notes : []);
    } catch (err) {
      console.error("Failed to load lesson notes", err);
      setError(err?.response?.data?.message || "Failed to load lesson notes");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(note) {
    setEditingId(note._id);
    setForm({ title: note.title || "", content: note.content || "" });
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
    };

    if (!payload.title || !payload.content) {
      setError("Title and content are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      if (editingId) {
        await axios.put(`/teacher/students/${studentId}/notes/${editingId}`, payload, {
          withCredentials: true,
        });
      } else {
        await axios.post(`/teacher/students/${studentId}/notes`, payload, {
          withCredentials: true,
        });
      }

      resetForm();
      await loadNotes(studentId);
    } catch (err) {
      console.error("Failed to save lesson note", err);
      setError(err?.response?.data?.message || "Failed to save lesson note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId) {
    try {
      setError("");
      await axios.delete(`/teacher/students/${studentId}/notes/${noteId}`, {
        withCredentials: true,
      });
      if (editingId === noteId) resetForm();
      await loadNotes(studentId);
    } catch (err) {
      console.error("Failed to delete lesson note", err);
      setError(err?.response?.data?.message || "Failed to delete lesson note");
    }
  }

  return (
    <section className="panel notes-panel">
      <div className="panel-h">Personal lesson notes</div>
      <div className="panel-b notes-layout">
        <div className="notes-copy">
          <h2 className="h2">{editingId ? "Update note" : "Add a lesson note"}</h2>
          <p className="muted">
            Keep private notes for this student: lesson focus, goals, reminders, and follow-up points.
          </p>
        </div>

        <form className="form notes-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input
              className="input"
              type="text"
              value={form.title}
              onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              placeholder="Lesson focus, next steps, reminders..."
              maxLength={120}
            />
          </label>

          <label className="field">
            <span>Note</span>
            <textarea
              className="input"
              value={form.content}
              onChange={(e) => setForm((current) => ({ ...current, content: e.target.value }))}
              placeholder="Write your private lesson note here."
              rows={6}
              maxLength={4000}
            />
          </label>

          {error ? <p className="form-note error">{error}</p> : null}

          <div className="notes-form-actions">
            <button className="button-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Note" : "Save Note"}
            </button>
            {editingId ? (
              <button className="button" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="notes-list-wrap">
          <div className="notes-list-head">
            <h3 className="h2">Saved notes</h3>
            {!loading ? <span className="muted">{notes.length} total</span> : null}
          </div>

          {loading ? <p className="muted">Loading notes…</p> : null}
          {!loading && notes.length === 0 ? (
            <p className="muted">No notes yet for this student.</p>
          ) : null}

          <div className="notes-list">
            {notes.map((note) => (
              <article key={note._id} className="note-card">
                <div className="note-card-head">
                  <div>
                    <div className="note-title">{note.title}</div>
                    <div className="note-meta">
                      Updated {new Date(note.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="note-actions">
                    <button type="button" className="button" onClick={() => startEdit(note)}>
                      Edit
                    </button>
                    <button type="button" className="button" onClick={() => handleDelete(note._id)}>
                      Delete
                    </button>
                  </div>
                </div>
                <p className="note-content">{note.content}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
