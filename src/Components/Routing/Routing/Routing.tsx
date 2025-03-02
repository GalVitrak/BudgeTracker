import { Routes, Route } from "react-router-dom";
import Home from "../../Home/Home/Home";
import Login from "../../Auth/Login/Login";
import Dashboard from "../../Home/Dashboard/Dashboard";
import { BudgetPage } from "../../Budget/BudgetPage/BudgetPage";
import ProtectedRoute from "../../Auth/ProtectedRoute";
import NotFound from "../NotFound/NotFound";
import "./Routing.css";
import { SpendingTable } from "../../Spending/SpendingTable/SpendingTable";
import BudgetGraph from "../../Budget/BudgetGraph/BudgetGraph";
import { CategoriesManagement } from "../../Categories/CategoriesManagement/CategoriesManagement";
import { authStore } from "../../../Redux/AuthState";
import { useEffect, useState } from "react";

function Routing(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!authStore.getState().user
  );

  useEffect(() => {
    const unsubscribe = authStore.subscribe(
      () => {
        setIsLoggedIn(
          !!authStore.getState().user
        );
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <div className="Routing">
      <Routes>
        <Route path="/home" element={<Home />} />
        {isLoggedIn ? (
          <Route
            path="/"
            element={<Dashboard />}
          />
        ) : (
          <Route path="/" element={<Home />} />
        )}
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
          path="/spending-table"
          element={
            <ProtectedRoute>
              <SpendingTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget-settings"
          element={
            <ProtectedRoute>
              <BudgetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget-graph"
          element={
            <ProtectedRoute>
              <BudgetGraph />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default Routing;
