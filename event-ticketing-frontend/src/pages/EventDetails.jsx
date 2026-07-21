import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPublishedEventDetails } from "../services/eventService";
import { purchaseTicket } from "../services/ticketService";
import { useAuth } from "../auth/AuthContext";

function EventDetails() {
  const { eventId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await getPublishedEventDetails(eventId);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [eventId]);

  const handlePurchase = async (ticketTypeId) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    setPurchasingId(ticketTypeId);
    setMessage(null);

    try {
      await purchaseTicket(eventId, ticketTypeId);
      setMessage({
        type: "success",
        text: "Pass purchased successfully! You can view your pass in 'My Tickets'.",
      });
    } catch (error) {
      console.error("Purchase failed", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Purchase failed. Please try again.",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-slate-400 font-medium">Loading Event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h2 className="text-3xl font-extrabold text-white">Event Not Found</h2>
          <p className="mt-4 text-slate-400">
            The event you are looking for might have been removed or doesn't exist.
          </p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition mb-8"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7 m0 0l7-7 m-7 7h18" />
          </svg>
          Back to Events
        </Link>

        {/* Hero details card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 md:p-12 backdrop-blur-sm shadow-xl">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              {event.name}
            </h1>

            {/* Event Meta Details Grid */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</h4>
                  <p className="mt-1 text-base font-semibold text-slate-200">{formatDate(event.start)}</p>
                  {event.end && (
                    <p className="text-xs text-slate-400 mt-0.5">Ends: {formatDate(event.end)}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location / Venue</h4>
                  <p className="mt-1 text-base font-semibold text-slate-200">{event.venue}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Status Message */}
        {message && (
          <div
            className={`mt-8 flex items-start gap-3.5 rounded-2xl border p-5 ${
              message.type === "success"
                ? "border-emerald-800 bg-emerald-950/20 text-emerald-400"
                : "border-red-800 bg-red-950/20 text-red-400"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {message.type === "success" ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">{message.text}</p>
              {message.type === "success" && (
                <Link
                  to="/my-tickets"
                  className="mt-2.5 inline-flex items-center gap-1 text-sm font-bold text-white underline hover:text-slate-200 transition"
                >
                  View My Tickets Dashboard
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Ticket Options */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-white">Select Tickets</h2>
          <div className="mt-6 grid gap-6">
            {event.ticketTypes && event.ticketTypes.length > 0 ? (
              event.ticketTypes.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition duration-200 hover:border-slate-700"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{ticket.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{ticket.description || "Standard event entry pass."}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t border-slate-800 pt-4 sm:border-0 sm:pt-0">
                    <span className="text-2xl font-black text-indigo-400">
                      {ticket.price === 0 ? "Free" : `$${ticket.price.toFixed(2)}`}
                    </span>
                    <button
                      disabled={purchasingId !== null}
                      onClick={() => handlePurchase(ticket.id)}
                      className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 disabled:pointer-events-none disabled:opacity-40 transition flex items-center gap-2"
                    >
                      {purchasingId === ticket.id ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        "Purchase Ticket"
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center rounded-2xl border border-dashed border-slate-800 p-8 text-slate-500">
                No ticket types configured for this event.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
