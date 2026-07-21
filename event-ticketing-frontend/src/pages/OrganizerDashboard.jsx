import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { listOrganizerEvents, deleteEvent } from "../services/eventService";

function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchEvents = async (pageNum = 0) => {
    setLoading(true);
    try {
      const response = await listOrganizerEvents(pageNum, 10);
      if (response.data) {
        setEvents(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setPage(response.data.number || 0);
      }
    } catch (error) {
      console.error("Error fetching organizer events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  const handleDelete = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setDeleteConfirmId(null);
      fetchEvents(page); // Reload
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Failed to delete event. Make sure there are no dependencies or active sales.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-900 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Organizer console
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Create events, customize ticket categories, and manage live sales.
            </p>
          </div>
          <Link
            to="/organizer/create"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition duration-150 shrink-0"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-900 bg-slate-900/40 h-28" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Event details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Ticket Categories</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-6">
                        <div className="font-bold text-slate-100 text-base">{event.name}</div>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 font-semibold">
                          <span>Starts: {formatDate(event.start)}</span>
                          <span>•</span>
                          <span>Sales End: {formatDate(event.salesEnd)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span
                          className={`rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                            event.status === "PUBLISHED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-slate-300 font-medium max-w-[200px] truncate">
                        {event.venue}
                      </td>
                      <td className="px-6 py-6 text-sm text-slate-300 font-medium">
                        <div className="flex flex-wrap gap-2">
                          {event.ticketTypes?.map((t) => (
                            <span
                              key={t.id}
                              className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs font-bold text-slate-400 border border-slate-700/30"
                              title={`${t.description || "No description"} (${t.totalAvailable} available)`}
                            >
                              {t.name} - ${t.price.toFixed(0)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          <Link
                            to={`/organizer/edit/${event.id}`}
                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white transition duration-150"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(event.id)}
                            className="rounded-lg bg-red-950/20 px-3 py-1.5 text-xs font-bold text-red-400 border border-red-900/30 hover:bg-red-600 hover:text-white hover:border-red-600 transition duration-150"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/20 px-6 py-4">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-400">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="mt-16 text-center rounded-3xl border border-dashed border-slate-800 p-12 bg-slate-900/10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-slate-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-bold">No Organized Events</h3>
            <p className="mt-2 text-slate-400 max-w-sm mx-auto text-sm">
              You haven't created any events yet. Get started by creating your very first event page.
            </p>
            <Link
              to="/organizer/create"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition"
            >
              Create First Event
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/30 text-red-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">Delete Event</h3>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to delete this event? This action is permanent and cannot be undone. All ticket types and associated sales data will be wiped out.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition shadow-lg shadow-red-600/20"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizerDashboard;
