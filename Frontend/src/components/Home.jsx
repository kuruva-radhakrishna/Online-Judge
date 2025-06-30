import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const {user,setUser} = useAuth()
  return (
    <div className="oj-home-container">
      <section className="oj-hero">
        <h1>Welcome to <span className="oj-highlight">Online Judge</span></h1>
        <p className="oj-subtitle">Sharpen your coding skills, compete in contests, and join a vibrant developer community.</p>
        <div className="oj-hero-actions">
          {!user && <Link to="/signup" className="oj-btn oj-btn-primary">Get Started</Link>}
          <Link to="/problems" className="oj-btn oj-btn-secondary">Practice Problems</Link>
        </div>
      </section>
      <section className="oj-features">
        <div className="oj-feature-card">
          <h2>Practice Problems</h2>
          <p>Challenge yourself with a wide range of problems in algorithms, data structures, and more.</p>
        </div>
        <div className="oj-feature-card">
          <h2>Contests</h2>
          <p>Participate in live and virtual contests to test your skills against others and climb the leaderboard.</p>
        </div>
        <div className="oj-feature-card">
          <h2>Leaderboards</h2>
          <p>Track your progress and see how you rank among other coders in the community.</p>
        </div>
        {/* <div className="oj-feature-card">
          <h2>Discussions</h2>
          <p>Engage with the community, ask questions, and share solutions in our discussion forums.</p>
        </div> */}
      </section>
      {!user && <section className="oj-get-started">
        <h2>Ready to begin?</h2>
        <p>Sign up now and start your journey to becoming a better programmer!</p>
        <Link to="/signup" className="oj-btn oj-btn-primary">Sign Up</Link>
      </section>}
    </div>
  );
};

export default Home; 