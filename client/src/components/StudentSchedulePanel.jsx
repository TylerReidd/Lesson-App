import { useEffect, useState } from "react";
import axios from "../axios.js";

export default function StudentSchedulePanel() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLessons();
  }, []);

  async function loadLessons() {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/schedule/student/upcoming", {
        withCredentials: true,
      });
      setLessons(Array.isArray(data?.lessons) ? data.lessons : []);
    } catch (err) {
      console.error("Failed to load student schedule", err);
      setError(err?.response?.data?.message || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }

  const nextLesson = lessons[0];

  return (
    <section className="panel student-schedule-panel">
      <div className="panel-h">Upcoming lessons</div>
      <div className="panel-b schedule-panel-body">
        {error ? <p className="form-note error">{error}</p> : null}
        {loading ? <p className="muted">Loading lessons…</p> : null}

        {!loading && !nextLesson ? (
          <p className="muted">No upcoming lessons scheduled yet.</p>
        ) : null}

        {!loading && nextLesson ? (
          <div className="student-schedule-stack">
            <div className="schedule-highlight">
              <div className="label-caps">Next lesson</div>
              <h2 className="h2">{nextLesson.title || "Lesson"}</h2>
              <p className="schedule-meta">
                {new Date(nextLesson.start).toLocaleDateString()} ·{" "}
                {new Date(nextLesson.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} -{" "}
                {new Date(nextLesson.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </p>
              {nextLesson.teacher?.name ? (
                <p className="schedule-meta">With {nextLesson.teacher.name}</p>
              ) : null}
              {nextLesson.location ? <p className="schedule-meta">{nextLesson.location}</p> : null}
            </div>

            {lessons.length > 1 ? (
              <div className="schedule-preview-list">
                {lessons.slice(1, 4).map((lesson) => (
                  <article key={lesson._id} className="schedule-card compact">
                    <div className="schedule-card-main">
                      <div className="schedule-title-row">
                        <div className="schedule-title">{lesson.title || "Lesson"}</div>
                        <span className={`schedule-status schedule-status-${lesson.status || "scheduled"}`}>
                          {lesson.status || "scheduled"}
                        </span>
                      </div>
                      <div className="schedule-meta">
                        {new Date(lesson.start).toLocaleDateString()} ·{" "}
                        {new Date(lesson.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
