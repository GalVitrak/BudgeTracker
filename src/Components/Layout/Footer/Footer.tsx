/**
 * Footer Component
 * Displays copyright information and social links
 */

import "./Footer.css";
import {
  LinkedinOutlined,
  GithubOutlined,
} from "@ant-design/icons";

/**
 * Footer component that provides copyright and social media links
 * @returns The footer component
 */
export function Footer(): JSX.Element {
  return (
    <div className="Footer">
      <div className="copyright">
        <span>
          © {new Date().getFullYear()} גל ויטרק
          <div className="social-links">
            <a
              href="https://www.linkedin.com/in/gal-vitrak/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="LinkedIn Profile"
            >
              <LinkedinOutlined className="linkedin-icon" />
            </a>
            <a
              href="https://github.com/GalVitrak"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="GitHub Profile"
            >
              <GithubOutlined className="github-icon" />
            </a>
          </div>
        </span>
      </div>
    </div>
  );
}

export default Footer;
