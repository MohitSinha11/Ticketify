import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { validateTicket } from "../services/ticketService";

function StaffDashboard() {
  const [ticketId, setTicketId] = useState("");
  const [method, setMethod] = useState("MANUAL");
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    setValidationResult(null);

    try {
      const response = await validateTicket(ticketId.trim(), method);
      const result = response.data; // { ticketId, status }

      setValidationResult(result);

      // Add to session log
      const newLog = {
        id: ticketId.trim(),
        status: result.status,
        timestamp: new Date().toLocaleTimeString(),
        method: method,
      };
      setRecentLogs((prev) => [newLog, ...prev]);
    } catch (error) {
      console.error("Validation API error", error);
      const errorMsg = error.response?.data?.message || "Invalid ticket ID format or network error.";
      const failedResult = {
        ticketId: ticketId.trim(),
        status: "INVALID",
        error: errorMsg,
      };
      setValidationResult(failedResult);

      const newLog = {
        id: ticketId.trim(),
        status: "INVALID",
        timestamp: new Date().toLocaleTimeString(),
        method: method,
        error: errorMsg,
      };
      setRecentLogs((prev) => [newLog, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="border-b border-slate-900 pb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Staff Gate Portal
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Scan and validate entry passes at venue gates.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {/* Validation Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-6">Validate Entrance Pass</h2>

              <form onSubmit={handleValidate} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ticket Pass ID (UUID)
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Enter 36-character ticket UUID"
                    className="mt-2.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Validation Method
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMethod("MANUAL")}
                      className={`rounded-xl border py-3.5 text-sm font-bold transition ${
                        method === "MANUAL"
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-extrabold"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Manual Input
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("QR_CODE")}
                      className={`rounded-xl border py-3.5 text-sm font-bold transition ${
                        method === "QR_CODE"
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-extrabold"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      QR Code Scan
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !ticketId.trim()}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 transition disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Verifying ticket...
                    </>
                  ) : (
                    "Verify & Log Entry"
                  )}
                </button>
              </form>
            </div>

            {/* Validation Result Box */}
            {validationResult && (
              <div
                className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-start gap-4 transition-all duration-300 ${
                  validationResult.status === "VALID"
                    ? "border-emerald-800 bg-emerald-950/20 text-emerald-400"
                    : "border-red-800 bg-red-950/20 text-red-400"
                }`}
              >
                <div className="shrink-0 mt-1">
                  {validationResult.status === "VALID" ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900/30 text-emerald-400">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900/30 text-red-400">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    {validationResult.status === "VALID" ? "Access Granted" : "Access Denied"}
                  </h3>
                  <p className="text-sm font-semibold uppercase tracking-wider opacity-90">
                    Status: {validationResult.status}
                  </p>
                  <p className="text-xs font-semibold font-mono text-slate-400 select-all pt-1">
                    Ticket ID: {validationResult.ticketId}
                  </p>
                  {validationResult.error && (
                    <p className="mt-2 text-sm text-red-300 bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-900/30 font-medium">
                      Reason: {validationResult.error}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent Logs Panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 h-[500px] flex flex-col">
            <h2 className="text-lg font-bold text-slate-200 mb-4 shrink-0">Recent Gates Log</h2>

            {recentLogs.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {recentLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 text-xs font-semibold transition hover:bg-slate-900/50 ${
                      log.status === "VALID"
                        ? "border-emerald-950/40 bg-emerald-950/10 text-emerald-400"
                        : "border-red-950/40 bg-red-950/10 text-red-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-300">#{log.id.slice(0, 8)}...</span>
                      <span className="text-slate-500 font-bold">{log.timestamp}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded bg-slate-950/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-400">
                        {log.method}
                      </span>
                      <span className="font-bold text-[10px] tracking-wide uppercase">{log.status}</span>
                    </div>
                    {log.error && <p className="mt-2 text-[10px] opacity-70 italic line-clamp-2">Err: {log.error}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <svg className="h-10 w-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="mt-3 text-xs font-bold">No tickets validated yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
