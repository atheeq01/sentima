import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/admin/overview')
      .then(res => setUsers(res.data))
      .catch(() => alert('Failed to load users'));
  }, []);

  return (
    <div className="data-section">
      <h2>System Overview</h2>
      <ul>
        <li>Total Courses: {users.total_courses}</li>
        <li>Total Reviews: {users.total_reviews}</li>
        <li>Total Students: {users.total_students}</li>
        <li>Total Lecturers: {users.total_lecturers}</li>
        <li>Positive: {(users.sentiment_distribution?.positive * 100).toFixed(2)}%</li>
        <li>Negative: {(users.sentiment_distribution?.negative * 100).toFixed(2)}%</li>
        <li>Neutral: {(users.sentiment_distribution?.neutral * 100).toFixed(2)}%</li>
      </ul>
    </div>
  );
};
export default Users;