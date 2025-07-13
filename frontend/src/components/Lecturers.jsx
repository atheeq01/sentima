import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const Lecturers = () => {
  const [lecturers, setLecturers] = useState([]);

  useEffect(() => {
    axios.get('/admin/users')
      .then(res => setLecturers(res.data.filter(u => u.role === 'lecturer')))
      .catch(() => alert('Failed to load lecturers'));
  }, []);

  const deleteLecturer = (id) => {
    if (confirm('Delete this lecturer?')) {
      axios.delete(`/admin/users/${id}`).then(() => {
        setLecturers(prev => prev.filter(l => l.id !== id));
      });
    }
  };

  return (
    <div className="data-section">
      <h2>Lecturers</h2>
      <ul>
        {lecturers.map(l => (
          <li key={l.id}>
            {l.name} - {l.email}
            <button onClick={() => deleteLecturer(l.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lecturers;