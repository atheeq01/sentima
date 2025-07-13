import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import axios from '../api/axios';
import './Dashboard.css'; // A shared CSS file for styling

// Debounce utility function to limit how often we call the API
const debounce = (func, delay) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [reviewedCourseIds, setReviewedCourseIds] = useState(new Set());
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reviewText, setReviewText] = useState('');

  // New state for live sentiment prediction
  const [predictedSentiment, setPredictedSentiment] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [coursesRes, myReviewsRes] = await Promise.all([
          axios.get('/student/courses'),
          axios.get('/student/my-reviews')
        ]);
        setCourses(coursesRes.data || []);
        setReviewedCourseIds(new Set(myReviewsRes.data.map(review => review.course_id)));
      } catch (error) {
        console.error('Failed to load initial data:', error);
        alert('Failed to load dashboard. Please try again.');
      }
    };
    fetchInitialData();
  }, []);

  // API call function for sentiment prediction
  const predictSentiment = async (text) => {
    if (!text.trim() || text.length < 15) { // Don't predict for very short text
      setPredictedSentiment(null);
      return;
    }
    setIsPredicting(true);
    try {
      const res = await axios.post('/student/predict-sentiment', { text });
      setPredictedSentiment(res.data.sentiment);
    } catch (error) {
      console.error("Sentiment prediction failed:", error);
      setPredictedSentiment(null);
    } finally {
      setIsPredicting(false);
    }
  };

  // Create a memoized, debounced version of the prediction function
  const debouncedPredict = useCallback(debounce(predictSentiment, 500), []);

  const handleReviewTextChange = (e) => {
    const newText = e.target.value;
    setReviewText(newText);
    debouncedPredict(newText);
  };

  const handleSelectCourse = (course) => {
    if (selectedCourse?.id === course.id) {
      setSelectedCourse(null);
    } else {
      setSelectedCourse(course);
      setReviewText(''); // Clear previous text when selecting a new course
      setPredictedSentiment(null); // Clear previous sentiment
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      alert('Please write something in your review.');
      return;
    }
    try {
      await axios.post(`/student/course/${selectedCourse.id}/submit`, { text: reviewText });
      alert('Your review has been submitted successfully!');
      setReviewedCourseIds(prev => new Set(prev).add(selectedCourse.id));
      setSelectedCourse(null);
      setReviewText('');
      setPredictedSentiment(null);
    } catch (error) {
      console.error('Failed to submit review:', error);
      const errorMessage = error.response?.data?.detail || 'There was an error submitting your review.';
      alert(errorMessage);
    }
  };

  const sentimentEmoji = {
    positive: '😊',
    neutral: '😐',
    negative: '😠',
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <p>Select a course to view feedback summary or submit your own review.</p>
        </div>




        <div className="course-list-student">
          {courses.map(course => (
            <div
              key={course.id}
              className={`course-item ${selectedCourse?.id === course.id ? 'selected' : ''} ${reviewedCourseIds.has(course.id) ? 'reviewed' : ''}`}
              onClick={() => handleSelectCourse(course)}
            >
              <h4>{course.title}</h4>
              <div className="sentiment-summary">
                <span className="sentiment-positive">{course.positive_percent.toFixed(1)}% 😊</span>
                <span className="sentiment-neutral">{course.neutral_percent.toFixed(1)}% 😐</span>
                <span className="sentiment-negative">{course.negative_percent.toFixed(1)}% 😠</span>
              </div>
              {reviewedCourseIds.has(course.id) && <div className="reviewed-tag">Reviewed ✓</div>}
            </div>
          ))}
        </div>




        {selectedCourse && !reviewedCourseIds.has(selectedCourse.id) && (
          <div className="review-submission-area">
            <h3>Submit Your Feedback for: {selectedCourse.title}</h3>
            <form onSubmit={handleSubmitReview}>
              <textarea
                value={reviewText}
                onChange={handleReviewTextChange}
                placeholder="Share your thoughts on the course..."
                required
              />
              <div className="review-submission-footer">
                  <button type="submit" disabled={isPredicting}>Submit Feedback</button>
                  <div className="sentiment-prediction-display">
                    {isPredicting && <span className="sentiment-prediction-loading">Predicting...</span>}
                    {predictedSentiment && !isPredicting && (
                        <span className="sentiment-prediction">
                            Live Sentiment: <strong className={`sentiment-${predictedSentiment}`}>{predictedSentiment} {sentimentEmoji[predictedSentiment]}</strong>
                        </span>
                    )}
                  </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
