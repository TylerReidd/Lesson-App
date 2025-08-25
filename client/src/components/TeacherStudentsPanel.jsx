// src/components/TeacherStudentsPanel.jsx
import { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios.js';

  function TeacherStudentsPanel({ onSelect, activeId }, ref) {
  const [students, setStudents] = useState([]);
  const [localActive, setLocalActive] = useState(null);
  const [summary, setSummary] = useState(null)
  const selectedId = activeId ?? localActive;
  const navigate = useNavigate();

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


  // fetch summary for selected student
  useEffect(() => {
    if (!selectedId) return;
    axios.get(`/teacher/students/${selectedId}/summary`, {withCredentials:true})
      .then(({ data }) => { 
        setSummary(data)
    });
  }, [selectedId]);

  // fetch items for selected student + tab
  

  const handlePick = (s) => {
    // setLocalActive(s._id);
    onSelect?.(s);
    navigate(`/teacher/students/${s._id}`)
  };

  useImperativeHandle(ref, () => ({
    refresh:fetchStudents,
    clear: () => setLocalActive(null),
  }), [selectedId, onSelect])

  useEffect(() => {
    fetchStudents()
  }, []); // load once


  return (
    <div className="dashboard-grid mt-16">
      <aside style={{alignItems: 'center'}}>
        <ul style={{padding: ''}}>
          {students.map((s) => (
            <li key={s._id || s.id} style={{listStyleType:'none'}}>
              <button
                className="tab"
                style={{
                  alignItems: 'center',
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
        <button className='button' onClick={fetchStudents} >
          Refresh
        </button>
      </aside>

      <main className="dashboard-panel">
        {!selectedId ? (
          <div className="no-assignments">Select a student</div>
        ) : (
          <>
             {/* KPI pills only */}
            <div className="grid grid-sm-2 grid-lg-3" style={{ marginBottom: 12 }}>
              <Stat label="Questions" value={summary?.questions} />
              <Stat label="Videos" value={summary?.videos} />
              <Stat label="Assignments" value={summary?.assignments} />
            </div>
            {/* Big actions to open the detail pages */}
            <div className="students-actions" style={{ gap: 12 }}>
              <button className="button-primary" onClick={() => navigate(`/teacher/questions?studentId=${selectedId}`)}>Open Questions</button>
              <button className="button" onClick={() => navigate(`/teacher/videos?studentId=${selectedId}`)}>Open Videos</button>
              <button className="button" onClick={() => navigate(`/teacher/assignments?studentId=${selectedId}`)}>Open Assignments</button>
            </div>
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


export default forwardRef(TeacherStudentsPanel);