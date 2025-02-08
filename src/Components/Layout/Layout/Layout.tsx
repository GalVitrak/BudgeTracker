/**
 * Main Layout Component
 * Provides the application's base structure including header, main content, and footer
 */

import Header from "../Header/Header";
import { Footer } from "../Footer/Footer";
import Routing from "../../Routing/Routing/Routing";
import "./Layout.css";

/**
 * Layout component that wraps the entire application
 * Provides consistent structure and navigation
 * @returns The main application layout
 */
function Layout(): JSX.Element {
  return (
    <div className="Layout">
      <header>
        <Header />
      </header>

      <main>
        <Routing />
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Layout;
