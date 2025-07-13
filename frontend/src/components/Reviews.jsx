import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const Reviews = () => {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    axios.get('/student/courses')
      .then(res => setCourses(res.data))
      .catch(() => alert('Failed to fetch courses'));
  }, []);

  const submitReview = () => {
    if (!selected || !text) return alert('Select course and enter text');
    axios.post(`/student/course/${selected}/submit`, { text })
      .then(() => alert('Review submitted'))
      .catch(() => alert('Failed to submit'));
  };

  return (
    <div className="data-section">
      <h2>Submit Review</h2>
      <select value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">Select Course</option>
        {courses.map(c => <option value={c.id} key={c.id}>{c.title}</option>)}
      </select>
      <textarea placeholder="Write your review..." value={text} onChange={e => setText(e.target.value)} />
      <button onClick={submitReview}>Submit</button>
    </div>
  );
};
export default Reviews;