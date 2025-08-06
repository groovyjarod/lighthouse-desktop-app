import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./src/styles.css";
import Home from "./pages/Home";
import AuditMenu from "./pages/AuditMenu";
import AuditAll from "./pages/AuditAll";
import AuditCompare from "./pages/AuditCompare";
import AuditOne from "./pages/AuditOne";
import AuditTransfer from "./pages/AuditTransfer";
import ListMenu from "./pages/ListMenu";
import ListAudits from "./pages/ListAudits"
import ListComparisons from "./pages/ListComparisons";
import ListOldAudits from "./pages/ListOldAudits";
import ListCustomAudits from "./pages/ListCustomAudits";
import SettingsMenu from "./pages/SettingsMenu";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="test-menu">
          <Route index element={<AuditMenu />} />
          <Route path="test-all" element={<AuditAll />} />
          <Route path="test-single" element={<AuditOne />} />
          <Route path="test-transfer" element={<AuditTransfer />} />
        </Route>
        <Route path="lists-menu">
          <Route index element={<ListMenu />} />
          <Route path="view-audits" element={<ListAudits />} />
          <Route path="view-old-audits" element={<ListOldAudits />} />
          <Route path="view-custom-audits" element={<ListCustomAudits />} />
        </Route>
        <Route path="files-menu" element={<SettingsMenu />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
