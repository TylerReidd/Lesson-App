import { useEffect, useMemo, useState } from "react";
import axios from "../axios.js";

const EMPTY_FORM = {
  studentId: "",
  title: "Lesson",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  notes: "",
  status: "scheduled",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function startOfWeek(date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function endOfWeek(date) {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  return endOfDay(next);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function eachDayOfInterval(start, end) {
  const days = [];
  const cursor = startOfDay(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toKey(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function getDefaultScheduleFields(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setMinutes(0, 0, 0);
  if (start <= new Date()) start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return {
    date: start.toISOString().slice(0, 10),
    startTime: start.toTimeString().slice(0, 5),
    endTime: end.toTimeString().slice(0, 5),
  };
}

function buildFreshForm(studentId = "", baseDate = new Date()) {
  return {
    ...EMPTY_FORM,
    ...getDefaultScheduleFields(baseDate),
    studentId,
  };
}

function toLocalInput(date) {
  const d = new Date(date);
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
}

function toPayload(form) {
  const start = new Date(`${form.date}T${form.startTime}`);
  const end = new Date(`${form.date}T${form.endTime}`);
  return {
    studentId: form.studentId,
    title: form.title.trim() || "Lesson",
    start: start.toISOString(),
    end: end.toISOString(),
    location: form.location.trim(),
    notes: form.notes.trim(),
    status: form.status,
  };
}

function monthLabel(date) {
  return date.toLocaleDateString([], { month: "long", year: "numeric" });
}

function lessonTimeRange(lesson) {
  const start = new Date(lesson.start);
  const end = new Date(lesson.end);
  return `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export default function TeacherSchedulePanel() {
  const [previewLessons, setPreviewLessons] = useState([]);
  const [monthLessons, setMonthLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => buildFreshForm());
  const [error, setError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (!expanded) return;
    loadMonthLessons(calendarMonth);
  }, [expanded, calendarMonth]);

  async function loadBaseData() {
    try {
      setLoading(true);
      setError("");
      const [{ data: lessonData }, { data: studentData }] = await Promise.all([
        axios.get("/schedule/teacher/upcoming", { withCredentials: true }),
        axios.get("/teacher/students", { withCredentials: true }),
      ]);
      const nextPreview = Array.isArray(lessonData?.lessons) ? lessonData.lessons : [];
      const nextStudents = Array.isArray(studentData?.students) ? studentData.students : [];
      setPreviewLessons(nextPreview);
      setStudents(nextStudents);
      setForm((current) =>
        current.studentId || !nextStudents[0]?._id
          ? current
          : { ...current, studentId: nextStudents[0]._id }
      );
    } catch (err) {
      console.error("Failed to load teacher schedule", err);
      setError(err?.response?.data?.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }

  async function loadMonthLessons(monthDate) {
    try {
      setCalendarLoading(true);
      setError("");
      const rangeStart = startOfWeek(startOfMonth(monthDate));
      const rangeEnd = endOfWeek(endOfMonth(monthDate));
      const { data } = await axios.get("/schedule/teacher/range", {
        withCredentials: true,
        params: {
          start: rangeStart.toISOString(),
          end: rangeEnd.toISOString(),
        },
      });
      setMonthLessons(Array.isArray(data?.lessons) ? data.lessons : []);
    } catch (err) {
      console.error("Failed to load calendar lessons", err);
      setError(err?.response?.data?.message || "Failed to load calendar");
    } finally {
      setCalendarLoading(false);
    }
  }

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    return eachDayOfInterval(startOfWeek(monthStart), endOfWeek(endOfMonth(calendarMonth)));
  }, [calendarMonth]);

  const lessonsByDay = useMemo(() => {
    const grouped = new Map();
    for (const lesson of monthLessons) {
      const key = toKey(new Date(lesson.start));
      const list = grouped.get(key) || [];
      list.push(lesson);
      grouped.set(key, list);
    }
    for (const [key, list] of grouped.entries()) {
      list.sort((a, b) => new Date(a.start) - new Date(b.start));
      grouped.set(key, list);
    }
    return grouped;
  }, [monthLessons]);

  const selectedLessons = useMemo(() => {
    return lessonsByDay.get(toKey(selectedDate)) || [];
  }, [lessonsByDay, selectedDate]);

  function resetForm(baseDate = selectedDate) {
    setEditingId(null);
    setForm(buildFreshForm(form.studentId || students[0]?._id || "", baseDate));
  }

  function beginCreate(baseDate = selectedDate) {
    setExpanded(true);
    setEditingId(null);
    setSelectedDate(startOfDay(baseDate));
    setCalendarMonth(startOfMonth(baseDate));
    setForm(buildFreshForm(form.studentId || students[0]?._id || "", baseDate));
    setError("");
  }

  function beginEdit(lesson) {
    const start = toLocalInput(lesson.start);
    const end = toLocalInput(lesson.end);
    const lessonDate = new Date(lesson.start);
    setExpanded(true);
    setEditingId(lesson._id);
    setSelectedDate(startOfDay(lessonDate));
    setCalendarMonth(startOfMonth(lessonDate));
    setForm({
      studentId: lesson.student?._id || "",
      title: lesson.title || "Lesson",
      date: start.date,
      startTime: start.time,
      endTime: end.time,
      location: lesson.location || "",
      notes: lesson.notes || "",
      status: lesson.status || "scheduled",
    });
    setError("");
  }

  async function refreshSchedule(monthDate = calendarMonth) {
    await loadBaseData();
    if (expanded) {
      await loadMonthLessons(monthDate);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.studentId) {
      setError("Choose a student first.");
      return;
    }
    if (!form.date || !form.startTime || !form.endTime) {
      setError("Date, start time, and end time are required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = toPayload(form);
      if (editingId) {
        await axios.put(`/schedule/teacher/lessons/${editingId}`, payload, {
          withCredentials: true,
        });
      } else {
        await axios.post("/schedule/teacher/lessons", payload, {
          withCredentials: true,
        });
      }
      const nextDate = new Date(`${form.date}T12:00:00`);
      setSelectedDate(startOfDay(nextDate));
      setCalendarMonth(startOfMonth(nextDate));
      await refreshSchedule(startOfMonth(nextDate));
      resetForm(nextDate);
    } catch (err) {
      console.error("Failed to save lesson", err);
      setError(err?.response?.data?.message || "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(lessonId) {
    try {
      setError("");
      await axios.delete(`/schedule/teacher/lessons/${lessonId}`, {
        withCredentials: true,
      });
      if (editingId === lessonId) resetForm();
      await refreshSchedule();
    } catch (err) {
      console.error("Failed to delete lesson", err);
      setError(err?.response?.data?.message || "Failed to delete lesson");
    }
  }

  function dayState(day) {
    return [
      "calendar-day",
      day.getMonth() !== calendarMonth.getMonth() ? "outside" : "",
      sameDay(day, new Date()) ? "today" : "",
      sameDay(day, selectedDate) ? "selected" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <section className="panel schedule-panel">
      <div className="panel-h">Upcoming schedule</div>
      <div className="panel-b schedule-panel-body">
        <div className="schedule-panel-head">
          <div className="overview-copy">
            <h2 className="h2">Upcoming lessons</h2>
            <p className="muted">
              Keep your schedule close at hand without letting it take over the dashboard.
            </p>
          </div>
          <div className="schedule-head-actions">
            <button type="button" className="button" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Hide Schedule" : "Open Schedule"}
            </button>
            <button type="button" className="button-primary" onClick={() => beginCreate(selectedDate)}>
              Add Lesson
            </button>
          </div>
        </div>

        {error ? <p className="form-note error">{error}</p> : null}
        {loading ? <p className="muted">Loading schedule…</p> : null}

        {!loading && previewLessons.length === 0 ? (
          <div className="schedule-empty">
            <p className="muted">No upcoming lessons yet.</p>
          </div>
        ) : null}

        {!loading && previewLessons.length > 0 ? (
          <div className="schedule-preview-list">
            {previewLessons.slice(0, 3).map((lesson) => (
              <ScheduleCard
                key={lesson._id}
                lesson={lesson}
                compact
                onEdit={beginEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : null}

        {expanded ? (
          <div className="schedule-expanded">
            <div className="schedule-calendar-layout">
              <section className="panel schedule-calendar-card">
                <div className="panel-h schedule-calendar-head">
                  <button type="button" className="button" onClick={() => setCalendarMonth((current) => addMonths(current, -1))}>
                    Previous
                  </button>
                  <div className="schedule-month-label">{monthLabel(calendarMonth)}</div>
                  <button type="button" className="button" onClick={() => setCalendarMonth((current) => addMonths(current, 1))}>
                    Next
                  </button>
                </div>
                <div className="panel-b schedule-calendar-body">
                  <div className="calendar-weekdays">
                    {WEEKDAY_LABELS.map((label) => (
                      <div key={label} className="calendar-weekday">
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="calendar-grid">
                    {calendarDays.map((day) => {
                      const dayLessons = lessonsByDay.get(toKey(day)) || [];
                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          className={dayState(day)}
                          onClick={() => setSelectedDate(startOfDay(day))}
                        >
                          <div className="calendar-day-number">{day.getDate()}</div>
                          <div className="calendar-day-events">
                            {dayLessons.slice(0, 2).map((lesson) => (
                              <span key={lesson._id} className={`calendar-chip ${lesson.status || "scheduled"}`}>
                                {new Date(lesson.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} {lesson.student?.name || "Lesson"}
                              </span>
                            ))}
                            {dayLessons.length > 2 ? (
                              <span className="calendar-chip more">+{dayLessons.length - 2} more</span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="panel schedule-day-card">
                <div className="panel-h">Agenda for {selectedDate.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</div>
                <div className="panel-b schedule-day-body">
                  <div className="schedule-day-actions">
                    <button type="button" className="button-primary" onClick={() => beginCreate(selectedDate)}>
                      Add Lesson on This Day
                    </button>
                  </div>
                  {calendarLoading ? <p className="muted">Loading calendar…</p> : null}
                  {!calendarLoading && selectedLessons.length === 0 ? (
                    <p className="muted">No lessons scheduled for this day.</p>
                  ) : null}
                  <div className="schedule-list">
                    {selectedLessons.map((lesson) => (
                      <ScheduleCard key={lesson._id} lesson={lesson} onEdit={beginEdit} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <form className="panel schedule-form-card" onSubmit={handleSubmit}>
              <div className="panel-h">{editingId ? "Edit lesson" : "Create lesson"}</div>
              <div className="panel-b schedule-form-grid">
                <label className="field">
                  <span>Student</span>
                  <select
                    className="select"
                    value={form.studentId}
                    onChange={(e) => setForm((current) => ({ ...current, studentId: e.target.value }))}
                  >
                    <option value="">Choose a student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Title</span>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                    placeholder="Lesson"
                  />
                </label>

                <label className="field">
                  <span>Date</span>
                  <input
                    className="input"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
                  />
                </label>

                <label className="field">
                  <span>Start time</span>
                  <input
                    className="input"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((current) => ({ ...current, startTime: e.target.value }))}
                  />
                </label>

                <label className="field">
                  <span>End time</span>
                  <input
                    className="input"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((current) => ({ ...current, endTime: e.target.value }))}
                  />
                </label>

                <label className="field">
                  <span>Status</span>
                  <select
                    className="select"
                    value={form.status}
                    onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>

                <label className="field schedule-form-wide">
                  <span>Location or link</span>
                  <input
                    className="input"
                    value={form.location}
                    onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
                    placeholder="Studio, Zoom link, room, address..."
                  />
                </label>

                <label className="field schedule-form-wide">
                  <span>Notes</span>
                  <textarea
                    className="input"
                    rows={4}
                    value={form.notes}
                    onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                    placeholder="Optional prep notes or reminders"
                  />
                </label>

                <div className="schedule-form-actions schedule-form-wide">
                  <button className="button-primary" type="submit" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update Lesson" : "Save Lesson"}
                  </button>
                  <button className="button" type="button" onClick={() => resetForm(selectedDate)}>
                    Clear
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ScheduleCard({ lesson, compact = false, onEdit, onDelete }) {
  return (
    <article className={`schedule-card ${compact ? "compact" : ""}`}>
      <div className="schedule-card-main">
        <div className="schedule-title-row">
          <div className="schedule-title">{lesson.title || "Lesson"}</div>
          <span className={`schedule-status schedule-status-${lesson.status || "scheduled"}`}>
            {lesson.status || "scheduled"}
          </span>
        </div>
        <div className="schedule-meta">
          {new Date(lesson.start).toLocaleDateString()} · {lessonTimeRange(lesson)}
        </div>
        <div className="schedule-meta">{lesson.student?.name || "Student"}</div>
        {lesson.location ? <div className="schedule-meta">{lesson.location}</div> : null}
        {!compact && lesson.notes ? <p className="schedule-notes">{lesson.notes}</p> : null}
      </div>
      <div className="schedule-card-actions">
        <button type="button" className="button" onClick={() => onEdit(lesson)}>
          Edit
        </button>
        <button type="button" className="button" onClick={() => onDelete(lesson._id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
