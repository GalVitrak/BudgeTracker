import "./Footer.css";
import {
  LinkedinOutlined,
  GithubOutlined,
} from "@ant-design/icons";

export function Footer(): JSX.Element {
  return (
    <div className="Footer">
      <div className="copyright">
        <span>© {new Date().getFullYear()}</span>
        <span>נבנה באהבה</span>
        <span className="heart">❤</span>
        <span className="author-section">
          על ידי&nbsp;&nbsp;גל ויטרק
          <div className="social-links">
            <a
              href="https://www.linkedin.com/in/gal-vitrak/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <LinkedinOutlined className="linkedin-icon" />
            </a>
            <a
              href="https://github.com/GalVitrak"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <GithubOutlined className="github-icon" />
            </a>
          </div>
        </span>
      </div>
    </div>
  );
}
