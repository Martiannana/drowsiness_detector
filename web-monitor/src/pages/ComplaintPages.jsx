import React, { useEffect, useState } from "react";

const STORAGE_KEY = "safe_commute_complaints_v1";

function read() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export default function ComplaintPage() {
  const [name, setName] = useState("");
  const [ticketNo, setTicketNo] = useState("");
  const [complaint, setComplaint] = useState("");
  const [complaints, setComplaints] = useState(read());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  }, [complaints]);

  const submit = () => {
    if (!name.trim() || !complaint.trim()) return alert("Name and complaint required");
    const c = {
      id: Date.now().toString(),
      name: name.trim(),
      ticketNo: ticketNo.trim(),
      complaint: complaint.trim(),
      createdAt: new Date().toISOString()
    };
    setComplaints(prev => [c, ...prev]);
    setName(""); setTicketNo(""); setComplaint("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Passenger Complaints</h2>

      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ width: 400, padding: 8, marginBottom: 8 }} /><br />
      <input placeholder="Ticket Number (optional)" value={ticketNo} onChange={e => setTicketNo(e.target.value)} style={{ width: 400, padding: 8, marginBottom: 8 }} /><br />
      <textarea placeholder="Complaint" value={complaint} onChange={e => setComplaint(e.target.value)} style={{ width: 400, height: 100, padding: 8 }} /><br />
      <button onClick={submit} style={{ padding: "8px 16px", marginTop: 8 }}>Submit</button>

      <h3 style={{ marginTop: 24 }}>Recent Complaints</h3>
      <ul>
        {complaints.map(c => (
          <li key={c.id} style={{ marginBottom: 12 }}>
            <strong>{c.name}</strong> {c.ticketNo ? `(Ticket: ${c.ticketNo})` : ""}<br />
            {c.complaint}<br />
            <small>{new Date(c.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
