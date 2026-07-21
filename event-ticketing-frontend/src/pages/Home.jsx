import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";
import { getPublishedEvents } from "../services/eventService";

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchEvents = async (query = "", pageNum = 0) => {
    setLoading(true);
    try {
      const response = await getPublishedEvents(query, pageNum, 9);
      if (response.data) {
        setEvents(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        setPage(response.data.number || 0);
      }
    } catch (error) {
      console.error("Error fetching published events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(searchQuery, page);
  }, [searchQuery, page]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(0); // Reset to first page on new search
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-950 pb-20 pt-24">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl">
              Discover & Secure Your Next Experience
            </h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed">
              Find Concerts, Workshops, Meetups, and Festivals. Instantly book tickets using keyless, secure passes.
            </p>
            <div className="mt-10">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </div>

      {/* Events Listing */}
      <div className="mx-auto max-w-7xl px-6 pb-24">
        <div className="flex items-center justify-between border-b border-slate-900 pb-5">
          <h2 className="text-3xl font-extrabold tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Featured Events"}
          </h2>
          <span className="text-sm font-semibold text-slate-500">
            {totalElements} events found
          </span>
        </div>

        {loading ? (
          /* Loading Skeletons */
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-900 bg-slate-900/40 p-6 h-96">
                <div className="h-40 rounded-xl bg-slate-800" />
                <div className="mt-4 h-6 w-3/4 rounded bg-slate-800" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-800" />
                <div className="mt-6 h-10 w-full rounded-xl bg-slate-800" />
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-4">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-300 hover:border-slate-700 hover:text-white disabled:pointer-events-none disabled:opacity-40 transition"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <span className="text-sm font-bold text-slate-400">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-300 hover:border-slate-700 hover:text-white disabled:pointer-events-none disabled:opacity-40 transition"
                >
                  Next
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="mt-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-slate-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-bold">No Events Found</h3>
            <p className="mt-2 text-slate-400 max-w-sm mx-auto">
              We couldn't find any published events. Try searching for something else or check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;