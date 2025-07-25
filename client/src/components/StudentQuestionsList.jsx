import React, { useEffect, useState } from 'react';
import axios from '../axios.js';

export default function StudentQuestionsList({reload}) {
  const [questions, setQuestions] = useState([]);

  const fetch = async () => {
    const { data } = await axios.get('/questions/me');
    setQuestions(data);
  };

  useEffect(() => {
    axios.get(
      '/questions/me',
       {withCredentials: true})
       .then(r => setQuestions(r.data))
  }, [reload]);
  if (!questions.length) return <p>No questions yet</p>

  return (
    <div className="space-y-4">
      {questions.map(q => (
        <div key={q.id} className="p-4 border rounded">
          <p><strong>Q:</strong> {q.text}</p>
          {q.answer ? (
            <p><strong>A:</strong> {q.answer}</p>
          ) : (
            <p className="italic text-gray-500">Awaiting response…</p>
          )}
        </div>
      ))}
    </div>
  );
}