import React from "react";
import "../styles/About.css"; 

function About() {
  return (
    <div className="about-container">
      <div className="about-box">
        <h1>About the Course Feedback Analysis Platform</h1>

        <section className="about-section">
         
          <p>
            <strong>What is this platform?</strong>
            <br />
            Course Feedback Analysis is a platform designed to collect and analyze student feedback on university courses. Using sentiment analysis, we help identify areas of improvement and enhance the learning experience.
          </p>
        </section>

        <section className="about-section">
          
          <p>
            <strong>Purpose & Benefits</strong>
            <br />
            - Helps improve course quality based on student feedback.
            <br />
            - Uses sentiment analysis to understand student opinions.
            <br />
            - Aims to create a better learning environment by addressing concerns.
          </p>
        </section>

        <section className="about-section">
          
          <p>
            <strong>Step-by-Step Process</strong>
            <br />
            1. Students submit feedback on their course experiences.
            <br />
            2. Sentiment analysis processes the feedback to determine positive, negative, or neutral sentiments.
            <br />
            3. Insights & reports help improve future course planning.
          </p>
        </section>

        <section className="about-section">
          
          <p>
            <strong>Key Technologies</strong>
            <br />
            - <strong>Programming Languages:</strong> Python, React
            <br />
            - <strong>Database:</strong> MySQL
            <br />
            - <strong>Sentiment Analysis:</strong> Natural Language Processing (NLP)
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
