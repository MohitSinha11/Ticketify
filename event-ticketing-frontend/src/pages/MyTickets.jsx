import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { listMyTickets, getTicketDetails, getTicketQrCodeBlobUrl } from "../services/ticketService";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  const fetchTickets = async (pageNum = 0) => {
    setLoading(true);
    try {
      const response = await listMyTickets(pageNum, 10);
      if (response.data) {
        setTickets(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setPage(response.data.number || 0);
      }
    } catch (error) {
      console.error("Error fetching tickets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(page);
  }, [page]);

  const handleOpenTicket = async (ticketId) => {
    setModalLoading(true);
    setSelectedTicket(null);
    if (qrCodeUrl) {
      URL.revokeObjectURL(qrCodeUrl);
      setQrCodeUrl(null);
    }

    try {
      // 1. Fetch full ticket details
      const detailsRes = await getTicketDetails(ticketId);
      setSelectedTicket(detailsRes.data);

      // 2. Fetch QR Code image as Blob URL
      const url = await getTicketQrCodeBlobUrl(ticketId);
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error loading ticket pass", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
    if (qrCodeUrl) {
      URL.revokeObjectURL(qrCodeUrl);
      setQrCodeUrl(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="border-b border-slate-900 pb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            My Tickets Wallet
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            View, manage, and present your digital entry passes.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-900 bg-slate-900/40 p-6 h-48" />
            ))}
          </div>
        ) : tickets.length > 0 ? (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleOpenTicket(ticket.id)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-md transition duration-200 hover:-translate-y-1 hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                        {ticket.ticketType?.name || "Entry Pass"}
                      </span>
                      <h3 className="mt-3 text-lg font-extrabold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {ticket.eventName || ticket.ticketType?.eventName || "Event Pass"}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-500 font-medium mt-0.5">
                        ID: #{ticket.id.slice(0, 8)}
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-200">
                        {ticket.ticketType?.price === 0 ? "Free" : `$${ticket.ticketType?.price?.toFixed(2)}`}
                      </p>
                    </div>

                    <span
                      className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider shrink-0 ${
                        ticket.status === "ACTIVE" || ticket.status === "VALIDATED" || ticket.status === "PURCHASED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-xs text-slate-400 font-semibold border-t border-slate-800 pt-4 group-hover:text-indigo-400 transition-colors">
                    <span>Click to view Entry Pass</span>
                    <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <span className="text-sm font-bold text-slate-400">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-slate-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-bold">No Passes Purchased</h3>
            <p className="mt-2 text-slate-400 max-w-sm mx-auto">
              You haven't bought any tickets yet. Explore the published events and grab one!
            </p>
            <a
              href="/"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
            >
              Browse Events
            </a>
          </div>
        )}
      </div>

      {/* Ticket Modal Loader */}
      {modalLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-sm font-semibold tracking-wide text-slate-400">Decrypting Pass...</p>
          </div>
        </div>
      )}

      {/* Interactive Wallet Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
            {/* Top Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 rounded-full bg-slate-950/60 p-2 text-slate-400 hover:text-white transition z-10"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Ticket Header Graphic Style */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
              <span className="rounded bg-slate-950/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Event Entry Pass
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-tight leading-tight line-clamp-2">
                {selectedTicket.eventName}
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-indigo-200">
                <div>
                  <h4>Status</h4>
                  <span className="mt-1 inline-block rounded bg-white/20 px-2 py-0.5 text-[10px] text-white">
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <h4>Price</h4>
                  <span className="mt-1 block text-sm font-black text-white">
                    {selectedTicket.price === 0 ? "Free" : `$${selectedTicket.price?.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Details & QR Code */}
            <div className="p-8 relative">
              {/* QR Container */}
              <div className="mt-2 flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-inner">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Ticket QR Code"
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center text-slate-400">
                    <span className="text-xs animate-pulse">Loading QR Code...</span>
                  </div>
                )}
                <span className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Scan at Entrance
                </span>
              </div>

              {/* Additional Details */}
              <div className="mt-8 space-y-4 border-t border-slate-800 pt-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Venue</h4>
                  <p className="mt-1 text-sm font-semibold text-slate-300">{selectedTicket.eventVenue}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date & Time</h4>
                  <p className="mt-1 text-sm font-semibold text-slate-300">{formatDate(selectedTicket.eventStart)}</p>
                </div>
                {selectedTicket.description && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pass Details</h4>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{selectedTicket.description}</p>
                  </div>
                )}
                <div className="text-center pt-4">
                  <span className="text-[10px] font-bold uppercase text-slate-500 select-all font-mono">
                    Pass ID: {selectedTicket.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTickets;
