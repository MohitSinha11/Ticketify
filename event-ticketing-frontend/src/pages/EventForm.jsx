import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createEvent, getOrganizerEvent, updateEvent } from "../services/eventService";

function EventForm() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!eventId;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    start: "",
    end: "",
    venue: "",
    salesStart: "",
    salesEnd: "",
    status: "DRAFT",
    ticketTypes: [
      { name: "General Admission", price: 0, totalAvailable: 100, description: "" }
    ]
  });

  // Helper to format Date from API (which is array or ISO string) to input compatible format YYYY-MM-DDTHH:MM
  const formatApiDateToInput = (dateVal) => {
    if (!dateVal) return "";
    // If dateVal is string like "2026-07-18T13:00:00"
    if (typeof dateVal === "string") {
      return dateVal.slice(0, 16);
    }
    // If dateVal is array [2026, 7, 18, 13, 0]
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour, minute] = dateVal;
      const pad = (num) => String(num).padStart(2, "0");
      return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
    }
    return "";
  };

  // Helper to format input Date to API format with seconds: YYYY-MM-DDTHH:MM:00
  const formatInputDateToApi = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split(":");
    if (parts.length === 2) {
      return `${dateString}:00`;
    }
    return dateString;
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const response = await getOrganizerEvent(eventId);
          const event = response.data;
          setFormData({
            name: event.name || "",
            start: formatApiDateToInput(event.start),
            end: formatApiDateToInput(event.end),
            venue: event.venue || "",
            salesStart: formatApiDateToInput(event.salesStart),
            salesEnd: formatApiDateToInput(event.salesEnd),
            status: event.status || "DRAFT",
            ticketTypes: event.ticketTypes?.map((t) => ({
              id: t.id,
              name: t.name || "",
              price: t.price || 0,
              totalAvailable: t.totalAvailable || 100,
              description: t.description || ""
            })) || []
          });
        } catch (err) {
          console.error("Failed to load event details", err);
          setError("Failed to load event details. Please verify your connection.");
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [eventId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTicketTypeChange = (index, field, value) => {
    const updatedTicketTypes = [...formData.ticketTypes];
    updatedTicketTypes[index][field] = field === "price" || field === "totalAvailable"
      ? (value === "" ? "" : Number(value))
      : value;
    setFormData((prev) => ({ ...prev, ticketTypes: updatedTicketTypes }));
  };

  const addTicketType = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        { name: "", price: 0, totalAvailable: 100, description: "" }
      ]
    }));
  };

  const removeTicketType = (index) => {
    const updatedTicketTypes = formData.ticketTypes.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, ticketTypes: updatedTicketTypes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Prepare payload
    const payload = {
      ...formData,
      start: formatInputDateToApi(formData.start),
      end: formatInputDateToApi(formData.end),
      salesStart: formatInputDateToApi(formData.salesStart),
      salesEnd: formatInputDateToApi(formData.salesEnd),
    };

    if (isEditMode) {
      payload.id = eventId;
    }

    try {
      if (isEditMode) {
        await updateEvent(eventId, payload);
      } else {
        await createEvent(payload);
      }
      navigate("/organizer");
    } catch (err) {
      console.error("Error saving event", err);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || "Failed to save event details. Review details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-slate-400">Loading Event Form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Back Link */}
        <Link
          to="/organizer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition mb-8"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7 m0 0l7-7 m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {isEditMode ? "Edit Event" : "Create New Event"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Provide event details, setup start times, and configure ticket tiers.
        </p>

        {error && (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-800 bg-red-950/20 p-5 text-red-400">
            <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Section: Basic Info */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-200">Basic Information</h2>

            <div className="grid gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Event Title</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Neon Summer Dance Festival"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Venue Location</label>
                <input
                  type="text"
                  name="venue"
                  required
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. Madison Square Garden, NY"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Dates */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-200">Event Timing</h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Event Start</label>
                <input
                  type="datetime-local"
                  name="start"
                  required
                  value={formData.start}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Event End</label>
                <input
                  type="datetime-local"
                  name="end"
                  required
                  value={formData.end}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Sales Start</label>
                <input
                  type="datetime-local"
                  name="salesStart"
                  required
                  value={formData.salesStart}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Sales End</label>
                <input
                  type="datetime-local"
                  name="salesEnd"
                  required
                  value={formData.salesEnd}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Status */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-200">Visibility Status</h2>
            <div className="max-w-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none font-bold"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
              </select>
            </div>
          </div>

          {/* Section: Ticket Types */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-200">Ticket Categories</h2>
              <button
                type="button"
                onClick={addTicketType}
                className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Add Category
              </button>
            </div>

            <div className="space-y-6 divide-y divide-slate-800/60">
              {formData.ticketTypes.map((ticket, index) => (
                <div key={index} className={`${index > 0 ? "pt-6" : ""} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-400">Category #{index + 1}</span>
                    {formData.ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(index)}
                        className="text-xs font-bold text-red-400 hover:text-red-300"
                      >
                        Remove Category
                      </button>
                    )}
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase">Category Name</label>
                      <input
                        type="text"
                        required
                        value={ticket.name}
                        onChange={(e) => handleTicketTypeChange(index, "name", e.target.value)}
                        placeholder="e.g. General Admission, VIP Access"
                        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase">Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={ticket.price}
                        onChange={(e) => handleTicketTypeChange(index, "price", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase">Capacity (Limit)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={ticket.totalAvailable}
                        onChange={(e) => handleTicketTypeChange(index, "totalAvailable", e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase">Description (Optional)</label>
                      <input
                        type="text"
                        value={ticket.description}
                        onChange={(e) => handleTicketTypeChange(index, "description", e.target.value)}
                        placeholder="e.g. Includes 1 free drink and express entry queue"
                        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 border-t border-slate-900 pt-8">
            <Link
              to="/organizer"
              className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                isEditMode ? "Save Changes" : "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;
