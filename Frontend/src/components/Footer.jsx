import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span>© {new Date().getFullYear()} Online Judge. All rights reserved.</span>
        </div>
        <div className="footer-center">
          <span>Made with <span role="img" aria-label="love">❤️</span> for coding competitions</span>
        </div>
        <div className="footer-right">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 