import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get('/admin/courses')
      .then(res => setCourses(res.data))
      .catch(() => alert('Failed to load courses'));
  }, []);

  return (
    <div className="data-section">
      <h2>Courses</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Code</th>
            <th>Positive %</th>
            <th>Negative %</th>
            <th>Neutral %</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td>{course.title}</td>
              <td>{course.code}</td>
              <td>{course.positive_percent}%</td>
              <td>{course.negative_percent}%</td>
              <td>{course.neutral_percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Courses;