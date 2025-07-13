import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from '../api/axios';
import './Dashboard.css'; // A shared CSS file for styling

const LecturerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [reviewsByCourse, setReviewsByCourse] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    const fetchCoursesAndReviews = async () => {
      try {
        const courseRes = await axios.get('/lecturer/courses');
        const fetchedCourses = courseRes.data;
        setCourses(fetchedCourses);

        // Fetch reviews for all courses in parallel for efficiency
        const reviewPromises = fetchedCourses.map(course =>
          axios.get(`/lecturer/reviews/${course.id}`)
        );
        const reviewResults = await Promise.all(reviewPromises);

        const reviewsMap = reviewResults.reduce((acc, res, index) => {
          const courseId = fetchedCourses[index].id;
          acc[courseId] = res.data;
          return acc;
        }, {});

        setReviewsByCourse(reviewsMap);

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        alert('Failed to load your courses and reviews.');
      }
    };

    fetchCoursesAndReviews();
  }, []);

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="dashboard-header">
          <h1>Your Dashboard</h1>
          <p>Here's an overview of the feedback on your courses.</p>
        </div>

        {courses.length === 0 && <p>You have not been assigned any courses yet.</p>}

        {courses.map(course => (
          <div key={course.id} className="course-card-lecturer">
            <div className="course-header" onClick={() => toggleCourse(course.id)}>
              <h3>{course.title} ({course.code})</h3>
              <div className="sentiment-summary">
                <span className="sentiment-positive">{course.positive_percent.toFixed(1)}% 😊</span>
                <span className="sentiment-neutral">{course.neutral_percent.toFixed(1)}% 😐</span>
                <span className="sentiment-negative">{course.negative_percent.toFixed(1)}% 😠</span>
              </div>
            </div>

            {expandedCourse === course.id && (
              <div className="course-reviews">
                <h4>Feedback Received ({reviewsByCourse[course.id]?.length || 0})</h4>
                <ul>
                  {(reviewsByCourse[course.id] || []).map(review => (
                    <li key={review.id} className={`review-item sentiment-${review.sentiment}`}>
                      <p>"{review.text}"</p>
                      <span>({review.sentiment})</span>
                    </li>
                  ))}
                  {(reviewsByCourse[course.id] || []).length === 0 && <li>No reviews yet.</li>}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LecturerDashboard;