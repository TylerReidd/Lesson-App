import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios.js";
import { AuthContext } from "../AuthContext.jsx";
import { useContext } from "react";

const PATHS = {
  teacher: {
    videos: "/teacher/videos",
    assignments: "/teacher/assignments",
    questions: "/teacher/questions",
    practice: "/teacher",
  },
  student: {
    videos: "/student/videos",
    assignments: "/student/assignments",
    questions: "/student/questions",
    practice: "/student",
  },
};

const LABELS = {
  videos: "Videos",
  assignments: "Assignments",
  questions: "Questions",
  practice: "Practice Logs",
};

export default function NotificationBell() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSummary = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.get("/notifications", { withCredentials: true });
      setSummary(data?.summary || null);
    } catch (err) {
      console.error("Notification fetch failed:", err);
      setSummary(null);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchSummary();
    const id = setInterval(fetchSummary, 60000);
    return () => clearInterval(id);
  }, [user, fetchSummary]);

  const total = summary?.total ?? 0;
  const role = user?.role;
  const rows = useMemo(() => {
    if (!summary) return [];
    return Object.entries(LABELS).map(([key, label]) => ({
      key,
      label,
      count: summary[key] ?? 0,
      path: PATHS[role]?.[key] || "/",
    }));
  }, [summary, role]);

  const toggle = () => setOpen((v) => !v);

  const markRead = async (types) => {
    if (!Array.isArray(types) || !types.length) return;
    try {
      setLoading(true);
      await axios.post(
        "/notifications/read",
        { types },
        { withCredentials: true }
      );
      await fetchSummary();
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = async (type, path) => {
    setOpen(false);
    await markRead([type]);
    navigate(path);
  };

  const handleMarkAll = async () => {
    await markRead(rows.map((row) => row.key));
  };

  if (!user) return null;

  return (
    <div className="notif-wrapper">
      <button
        type="button"
        className="notif-button"
        onClick={toggle}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a6 6 0 0 0-6 6v3.09l-.94 2.34A1 1 0 0 0 6 15h12a1 1 0 0 0 .88-1.45L18 11.09V8a6 6 0 0 0-6-6Zm0 20a2 2 0 0 0 1.94-1.5h-3.88A2 2 0 0 0 12 22Z"
          />
        </svg>
        {total > 0 && <span className="notif-badge">{total}</span>}
      </button>
      {open && (
        <div className="notif-dropdown" role="menu">
          <div className="notif-header">
            <strong>Notifications</strong>
            <button
              type="button"
              className="notif-clear"
              onClick={handleMarkAll}
              disabled={loading || total === 0}
            >
              Mark all read
            </button>
          </div>
          {rows.map(({ key, label, count, path }) => (
            <button
              key={key}
              type="button"
              className="notif-row"
              onClick={() => handleNavigate(key, path)}
            >
              <div>
                <div className="notif-label">{label}</div>
                <small className="notif-subtext">
                  {count > 0 ? `${count} new` : "No new items"}
                </small>
              </div>
              {count > 0 && <span className="notif-count">{count}</span>}
            </button>
          ))}
          {rows.every((row) => (row.count ?? 0) === 0) && (
            <div className="notif-empty">You're all caught up!</div>
          )}
        </div>
      )}
    </div>
  );
}
