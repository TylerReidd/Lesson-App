import React, { useState } from 'react';
import axios from '../axios.js';

export default function StudentQuestionForm({ onSent }) {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  const submit = async e => {
    e.preventDefault();
    try {
      await axios.post('/questions', { text }, {withCredentials: true});
      setText('');
      onSent();
    } catch (err) {
      setError(err.response?.data?.message || 'Send failed');
    }
  };

  return (
    <>
    <form onSubmit={submit} className="form-group">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type your question..."
        required
        
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="button">
        Send Question
      </button>
    </form>
    </>
  );
}
