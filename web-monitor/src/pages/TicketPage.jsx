import React, { useEffect, useState } from "react";
import { FileText, User, Phone, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { FirebaseService } from "../services/firebaseService";

function generateTicketNumber(existingTickets) {
  const now = new Date();
  const date = now.toISOString().split("T")[0].replace(/-/g, "");
  const todayCount = existingTickets.filter(t => t.ticketNumber && t.ticketNumber.includes(`TKT-${date}-`)).length;
  const next = todayCount + 1;
  return `TKT-${date}-${String(next).padStart(4, "0")}`;
}

export function ComplaintPage() {
  const [name, setName] = useState("");
  const [ticketNo, setTicketNo] = useState("");
  const [complaint, setComplaint] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Subscribe to real-time complaints updates
    const unsubscribe = FirebaseService.subscribeToComplaints((complaintsData) => {
      setComplaints(complaintsData);
    });

    return () => unsubscribe();
  }, []);

  const submit = async () => {
    if (!name.trim() || !complaint.trim()) {
      setError("Name and complaint are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await FirebaseService.createComplaint({
        name: name.trim(),
        ticketNumber: ticketNo.trim() || null,
        complaint: complaint.trim()
      });

      setName(""); 
      setTicketNo(""); 
      setComplaint("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError("Failed to submit complaint. Please try again.");
      console.error("Error submitting complaint:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-8 w-8 text-white" />
              <h2 className="text-3xl font-bold text-white">Passenger Complaints</h2>
            </div>
            <p className="text-red-100 mt-2">Help us improve your commute experience</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Complaint submitted successfully!</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name *
                </label>
                <input
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Ticket Number (Optional)
                </label>
                <input
                  placeholder="TKT-XXXXXXXX-XXXX"
                  value={ticketNo}
                  onChange={e => setTicketNo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Complaint Details *
              </label>
              <textarea
                placeholder="Please describe your complaint in detail..."
                value={complaint}
                onChange={e => setComplaint(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                disabled={loading}
              />
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>

          {/* Recent Complaints */}
          <div className="bg-gray-50 px-8 py-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Complaints</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {complaints.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No complaints submitted yet</p>
              ) : (
                complaints.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{c.name}</h4>
                      <div className="flex space-x-2">
                        {c.ticketNumber && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                            {c.ticketNumber}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          c.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {c.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{c.complaint}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TicketPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tickets, setTickets] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Subscribe to real-time tickets updates
    const unsubscribe = FirebaseService.subscribeToTickets((ticketsData) => {
      setTickets(ticketsData);
    });

    return () => unsubscribe();
  }, []);

  const handleGenerate = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in name and phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const ticketNumber = generateTicketNumber(tickets);
      await FirebaseService.createTicket({
        passengerName: name.trim(),
        phoneNumber: phone.trim(),
        ticketNumber
      });

      setName("");
      setPhone("");
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    } catch (err) {
      setError("Failed to generate ticket. Please try again.");
      console.error("Error generating ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-white" />
              <h2 className="text-3xl font-bold text-white">Generate Ticket</h2>
            </div>
            <p className="text-green-100 mt-2">Create your commute ticket quickly and easily</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {generated && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Ticket generated successfully!</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Passenger Name *
                </label>
                <input
                  placeholder="Enter passenger name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number *
                </label>
                <input
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Generating..." : "Generate Ticket"}
            </button>
          </div>

          {/* Recent Tickets */}
          <div className="bg-gray-50 px-8 py-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Tickets</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {tickets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tickets generated yet</p>
              ) : (
                tickets.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-green-700 text-lg">{t.ticketNumber}</h4>
                        <p className="text-gray-700 font-medium">{t.passengerName}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {t.phoneNumber}
                        </div>
                        <div className="flex space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            t.isUsed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {t.isUsed ? 'Used' : 'Valid'}
                          </span>
                          {t.currentSession && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              In Use
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}