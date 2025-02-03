import Routing from "../../Routing/Routing/Routing";
import { Footer } from "../Footer/Footer";
import Header from "../Header/Header";
import "./Layout.css";

function Layout(): JSX.Element {
  return (
    <div className="Layout">
      <header>
        <Header />
      </header>
      <main>
        <Routing />
      </main>
      <footer><Footer/></footer>
    </div>
  );
}

export default Layout;
