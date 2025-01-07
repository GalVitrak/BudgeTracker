import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import Layout from "./Components/Layout/Layout/Layout.tsx";

createRoot(
  document.getElementById("root")!
).render(
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
);
