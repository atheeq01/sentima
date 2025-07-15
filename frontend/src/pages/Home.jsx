import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css";

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="title">Welcome to the Course Feedback Analysis Platform</h1>
        <div className="paragraph-box">
          <p className="paragraph">
            This platform helps analyze student feedback on university courses using sentiment analysis.
            By collecting and processing feedback, we aim to improve course content and the learning
            experience. Your input helps shape better academic programs!
          </p>
        </div>
        <div className="buttons">
          {!user ? (
            <>
              <Link to="/login" className="btn1">
                Login
              </Link>
              <Link to="/register" className="btn2">
                Sign Up
              </Link>
            </>
          ) : (
            user.role === 'student' ? (
              <>
                <Link to="/dashboard#level-1" className="btn1">
                  Level 1
                </Link>
                <Link to="/dashboard#level-2" className="btn2">
                  Level 2
                </Link>
                <Link to="/dashboard#level-3" className="btn1">
                  Level 3
                </Link>
                <Link to="/dashboard#level-4" className="btn2">
                  Level 4
                </Link>
              </>
            ) : user.role === 'admin' ? (
              <>
                <Link to="/dashboard#users" className="btn1">
                  Users
                </Link>
                <Link to="/dashboard#courses" className="btn2">
                  Courses
                </Link>
                <Link to="/dashboard#reviews" className="btn1">
                  Reviews
                </Link>
              </>
            ) : user.role === 'lecturer' && (
              <>
                <Link to="/dashboard" className="btn1">
                  Student Feedbacks
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
