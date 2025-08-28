import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import BusTrackingMap from "./pages/BusTrackingMap";
import { ComplaintPage, TicketPage } from "./pages/TicketPage";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: 12, background: "#0f172a", color: "#fff" }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{ margin: '0 20px 0 0', fontSize: '20px', fontWeight: 'bold' }}>SafeCommute System</h1>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/" style={{ color: "#fff", textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              Map
            </Link>
            <Link to="/tickets" style={{ color: "#fff", textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              Tickets
            </Link>
            <Link to="/complaints" style={{ color: "#fff", textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
              Complaints
            </Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<BusTrackingMap />} />
        <Route path="/tickets" element={<TicketPage />} />
        <Route path="/complaints" element={<ComplaintPage />} />
      </Routes>
    </Router>
  );
}