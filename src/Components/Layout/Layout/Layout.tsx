import Routing from "../../Routing/Routing/Routing";
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
      <footer>footer</footer>
    </div>
  );
}

export default Layout;
