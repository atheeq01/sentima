import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import axios from "../api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/dashboard.css";

const debounce = (func, delay) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [reviewedCourseIds, setReviewedCourseIds] = useState(new Set());
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [predictedSentiment, setPredictedSentiment] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const location = useLocation();

  const fetchInitialData = useCallback(async () => {
    try {
      const [coursesRes, myReviewsRes] = await Promise.all([
        axios.get("/student/courses"),
        axios.get("/student/my-reviews"),
      ]);
      setCourses(coursesRes.data || []);
      setReviewedCourseIds(
        new Set(myReviewsRes.data.map((review) => review.course_id))
      );
    } catch (error) {
      console.error("Failed to load initial data:", error);
      toast.error("Failed to load dashboard. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location, courses]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const predictSentiment = async (text) => {
    if (!text.trim() || text.length < 15) {
      setPredictedSentiment(null);
      return;
    }
    setIsPredicting(true);
    try {
      const res = await axios.post("/student/predict-sentiment", { text });
      setPredictedSentiment(res.data.sentiment);
    } catch (error) {
      console.error("Sentiment prediction failed:", error);
      setPredictedSentiment(null);
    } finally {
      setIsPredicting(false);
    }
  };

  const debouncedPredict = useCallback(debounce(predictSentiment, 500), []);

  const handleReviewTextChange = (e) => {
    const newText = e.target.value;
    setReviewText(newText);
    debouncedPredict(newText);
  };

  const handleSelectCourse = (course) => {
    if (!reviewedCourseIds.has(course.id)) {
      setSelectedCourse(course);
      setReviewText("");
      setPredictedSentiment(null);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.warn("Please write something in your review.");
      return;
    }
    try {
      await axios.post(`/student/course/${selectedCourse.id}/submit`, {
        text: reviewText,
      });
      toast.success("Your review has been submitted successfully!");
      fetchInitialData(); // update live percentage of revi
      closeModal();
    } catch (error) {
      console.error("Failed to submit review:", error);
      const errorMessage =
        error.response?.data?.detail ||
        "There was an error submitting your review.";
      toast.error(errorMessage);
    }
  };

  const sentimentEmoji = {
    positive: "😊",
    neutral: "😐",
    negative: "😠",
  };

  const groupCoursesByLevel = (courses) => {
    return courses.reduce((acc, course) => {
      if (course.code) {
        const match = course.code.match(/\d/);
        if (match) {
          const level = `Level ${match[0]}`;
          if (!acc[level]) {
            acc[level] = [];
          }
          acc[level].push(course);
        }
      }
      return acc;
    }, {});
  };

  const groupedCourses = groupCoursesByLevel(courses);

  return (
    <div className="dashboard-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <p>
            Select a course to view feedback summary or submit your own review.
          </p>
        </div>

        {Object.keys(groupedCourses).sort().map(level => (
          <div key={level} className="level-section" id={level.toLowerCase().replace(' ', '-')}>
            <h2>{level}</h2>
            <div className="course-list-student">
              {groupedCourses[level].map((course) => (
                <div
                  key={course.id}
                  className={`course-item ${
                    selectedCourse?.id === course.id ? "selected" : ""
                  } ${reviewedCourseIds.has(course.id) ? "reviewed" : ""}`}
                  onClick={() => handleSelectCourse(course)}
                >
                  <h4>{course.title}</h4>
                  <p className="course-code">{course.code}</p>
                  <div className="sentiment-summary">
                    <span className="sentiment-positive">
                      {course.positive_percent.toFixed(1)}% 😊
                    </span>
                    <span className="sentiment-neutral">
                      {course.neutral_percent.toFixed(1)}% 😐
                    </span>
                    <span className="sentiment-negative">
                      {course.negative_percent.toFixed(1)}% 😠
                    </span>
                  </div>
                  {reviewedCourseIds.has(course.id) && (
                    <div className="reviewed-tag">Reviewed ✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          customClass="review-modal"
        >
          {selectedCourse && (
            <div className="review-submission-area">
              <h3>Submit Your Feedback for: {selectedCourse.title}</h3>
              <form onSubmit={handleSubmitReview}>
                <textarea
                  value={reviewText}
                  onChange={handleReviewTextChange}
                  placeholder="Share your thoughts on the course ..."
                  required
                />
                <div className="review-submission-footer">
                  <button type="submit" disabled={isPredicting}>
                    Submit Feedback
                  </button>
                  <div className="sentiment-prediction-display">
                    {isPredicting && (
                      <span className="sentiment-prediction-loading">
                        Predicting...
                      </span>
                    )}
                    {predictedSentiment && !isPredicting && (
                      <span className="sentiment-prediction">
                        Live Sentiment:{" "}
                        <strong className={`sentiment-${predictedSentiment}`}>
                          {predictedSentiment}{" "}
                          {sentimentEmoji[predictedSentiment]}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StudentDashboard;
