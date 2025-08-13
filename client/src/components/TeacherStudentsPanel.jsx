// src/components/TeacherStudentsPanel.jsx
import { useEffect, useState } from 'react';
import axios from '../axios.js';

export default function TeacherStudentsPanel({ onSelect, activeId }) {
  const [students, setStudents] = useState([]);
  const [localActive, setLocalActive] = useState(null);
  const [summary, setSummary] = useState(null);
  const [tab, setTab] = useState('questions');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedId = activeId ?? localActive;

  const fetchStudents = async () => {
    const {data} = await axios.get('/teacher/students');
    const list = data.students || [];
    setStudents(list)

    if(!selectedId && list.length) {
      const first = list[0]
      setLocalActive(first._id)
      onSelect?.(first)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, []); // load once

  // fetch summary for selected student
  useEffect(() => {
    if (!selectedId) return;
    axios.get(`/teacher/students/${selectedId}/summary`)
      .then(({ data }) => setSummary(data));
  }, [selectedId]);

  // fetch items for selected student + tab
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    const path = tab === 'questions' ? 'questions' : tab === 'videos' ? 'videos' : 'assignments';
    axios.get(`/teacher/students/${selectedId}/${path}`)
      .then(({ data }) => {
        const list =
          tab === 'questions' ? (data.questions || data.items || []) :
          tab === 'videos' ? (data.videos || data.items || []) :
                              (data.assignments || data.items|| [])
        setItems(list)
      })
      .finally(() => setLoading(false));
  }, [selectedId, tab]);

  const handlePick = (s) => {
    setLocalActive(s._id);
    onSelect?.(s);
  };

  return (
    <div className="dashboard-grid">
      <aside className="dashboard-panel" style={{ minWidth: 260 }}>
        <h3>My Students</h3>
        <button className='btn-ghost' onClick={fetchStudents} style={{marginBottom: 8}}>
          Refresh
        </button>
        <ul>
          {students.map((s) => (
            <li key={s._id || s.id}>
              <button
                className="tab"
                style={{
                  textAlign: 'left',
                  width: '100%',
                  background: selectedId === s._id ? '#f1f5ff' : 'transparent',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
                onClick={() => handlePick(s)}
              >
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div className="text-xs" style={{ color: '#666' }}>{s.email}</div>
              </button>
            </li>
          ))}
          {!students.length && <div className="no-assignments">No Linked students yet.</div>}
        </ul>
      </aside>

      <main className="dashboard-panel">
        {!selectedId ? (
          <div className="no-assignments">Select a student</div>
        ) : (
          <>
            {summary && (
              <div className="grid grid-sm-2 grid-lg-3" style={{ marginBottom: 12 }}>
                <Stat label="Questions" value={summary.questions} />
                <Stat label="Videos" value={summary.videos} />
                <Stat label="Assignments" value={summary.assignments} />
              </div>
            )}

            <div className="tabs-nav">
              {['questions', 'videos', 'assignments'].map((t) => (
                <button
                  key={t}
                  className={`tab-button ${tab === t ? 'active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {loading ? (
              <div>Loading…</div>
            ) : items.length ? (
              <ul>
                {items.map((i) => (
                  <li key={i._id || i.id}>
                    {tab === 'questions' && (
                      <div style={{ display: 'grid', gap: 6, width: '100%' }}>
                        <div className="q-text">{i.text}</div>
                        {i.answer && <div className="badge">Answer: {i.answer}</div>}
                        <div className="ts">{new Date(i.createdAt).toLocaleString()}</div>
                      </div>
                    )}
                    {tab === 'videos' && (
                      <a className="assignment-link" href={i.url || i.path} target="_blank" rel="noreferrer">
                        <span className="assignment-icon">🎬</span>
                        <div className="assignment-info">
                          <span className="assignment-title">{i.filename || i.title || 'Video'}</span>
                          <span className="assignment-date">{new Date(i.createdAt).toLocaleDateString()}</span>
                        </div>
                      </a>
                    )}
                    {tab === 'assignments' && (
                      <a className="assignment-link" href={i.url || i.path} target="_blank" rel="noreferrer">
                        <span className="assignment-icon">📄</span>
                        <div className="assignment-info">
                          <span className="assignment-title">{i.filename || i.title || 'Assignment'}</span>
                          <span className="assignment-date">{new Date(i.createdAt).toLocaleDateString()}</span>
                        </div>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-assignments">No {tab} yet for this student.</div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="assignment-card" style={{ textAlign: 'center' }}>
      <div className="assignment-title" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{value ?? 0}</div>
    </div>
  );
}
