import React, {useEffect, useState} from 'react';
import axios from '../axios.js';
import { useLocation } from 'react-router-dom';


export default function TeacherPracticePanel({studentId}) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
      if(!studentId) return;

      setLoading(true)
      axios
        .get(`/practice/teacher/${studentId}`, {withCredentials: true})
        .then((res) => {
          setLogs(Array.isArray(res.data) ? res.data : []);
        })
        .catch((err) => {
          console.error("Error fetching practice logs", err)
          setError("Failed to load practice logs");
          setLogs([])
        })
        .finally(() => setLoading(false))
    }, [studentId])

    if(!studentId) {
      return <div className="panel">Select a student to view practice logs</div>
    }

    if(loading) return <div className="panel">Loading...</div>
    if(error) return <div className="panel error">{error}</div>

    return (
      <div className="panel">
        <div className="panel-h">Practice Logs</div>
        <div className="panel-b">
          {logs.length === 0 ? (
            <p className="subtle">No logs submitted yet...</p>
          ) : (
            <div className="practice-log-list">
              {logs.map((log) => (
                <div key={log._id} className="card mb-3">
                  <div className="card-header">
                    <span>{new Date(log.date).toLocaleDateString()}</span>
                    <span className="subtle">- {log.lessonType || 'music'}</span>
                  </div>
                  <div className="card-body">
                    {log.durationMin && (
                      <p><b>Duration:</b>{log.durationMin} minutes</p>
                    )}
                    {log.focus && (
                      <p><b>Focus: </b>{log.focus}</p>
                    )}
                    {log.struggles && (
                      <p><b>Struggles</b>{log.struggles}</p>
                    )}
                    {log.wins && (
                      <p><b>Wins: </b>{logs.wins}</p>
                    )}
                    {log.notes && (
                      <p><b>Notes:</b>{log.notes}</p>
                    )}
                    {log.bpm && (
                      <p><b>Metronome: </b>{log.bpm}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
}