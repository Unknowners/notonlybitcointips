import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainApp from "./MainApp";
import CampaignPage from "./CampaignPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/donate/:id" element={<CampaignPage />} />
      </Routes>
    </BrowserRouter>
  );
}