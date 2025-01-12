import Login from "../../Auth/Login/Login";
import Register from "../../Auth/Register/Register";
import Home from "../../Home/Home/Home";
import { SpendingTable } from "../../Spending/SpendingTable/SpendingTable";
import "./Routing.css";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

function Routing(): JSX.Element {
  return (
    <div className="Routing">
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/spending-table"
          element={<SpendingTable />}
        />
        <Route
          path="/"
          element={<Navigate to="/home" />}
        />
      </Routes>
    </div>
  );
}

export default Routing;
