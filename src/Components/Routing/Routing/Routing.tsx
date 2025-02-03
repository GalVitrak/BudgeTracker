import { Routes, Route } from "react-router-dom";
import Home from "../../Home/Home/Home";
import Login from "../../Auth/Login/Login";
import Dashboard from "../../Home/Dashboard/Dashboard";
import { BudgetPage } from "../../Home/BudgetPage/BudgetPage";
import ProtectedRoute from "../../Auth/ProtectedRoute";
import NotFound from "../../Layout/NotFound/NotFound";
import "./Routing.css";

function Routing(): JSX.Element {
  return (
    <div className="Routing">
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <BudgetPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default Routing;
