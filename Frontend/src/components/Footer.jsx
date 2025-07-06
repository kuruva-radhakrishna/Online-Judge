import React from "react";
import "./Footer.css";
import { 
  Favorite as HeartIcon,
  Code as CodeIcon,
  EmojiEvents as TrophyIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-brand">
            <CodeIcon className="footer-logo" />
            <span>© {new Date().getFullYear()} CodeArena. All rights reserved.</span>
          </div>
        </div>
        <div className="footer-center">
          <span>
            Made with <HeartIcon className="heart-icon" /> for coding competitions
          </span>
        </div>
        <div className="footer-right">
          <div className="footer-links">
            <a href="/about" className="footer-link">
              <TrophyIcon className="footer-link-icon" />
              About
            </a>
            <a href="/contact" className="footer-link">
              <EmailIcon className="footer-link-icon" />
              Contact
            </a>
            <a href="/terms" className="footer-link">
              Terms
            </a>
          </div>
          <div className="footer-socials">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <GitHubIcon />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <LinkedInIcon />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <TwitterIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 