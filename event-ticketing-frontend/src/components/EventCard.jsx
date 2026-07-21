import { Link } from "react-router-dom";

function EventCard({ event }) {
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

  // Generate a beautiful, stable gradient based on the event name's length/characters
  const getGradient = (name) => {
    const gradients = [
      "from-pink-500 to-rose-500",
      "from-purple-600 to-indigo-600",
      "from-cyan-500 to-blue-600",
      "from-emerald-400 to-teal-600",
      "from-amber-400 to-orange-600",
      "from-fuchsia-600 to-purple-700",
      "from-violet-600 to-pink-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash += name.charCodeAt(i);
    }
    return gradients[hash % gradients.length];
  };

  const gradientClass = getGradient(event.name || "Event");

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10">
      {/* Event Gradient Cover */}
      <div className={`h-40 w-full bg-gradient-to-br ${gradientClass} relative flex items-end p-4 transition-transform duration-300 group-hover:scale-105`}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
        <div className="relative rounded-lg bg-slate-950/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm uppercase tracking-wider">
          Live Event
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors duration-150">
          {event.name}
        </h3>

        {/* Date and Time */}
        <div className="mt-4 flex items-center gap-2.5 text-sm text-slate-400">
          <svg
            className="h-4.5 w-4.5 text-indigo-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium">{formatDate(event.start)}</span>
        </div>

        {/* Venue */}
        <div className="mt-2.5 flex items-center gap-2.5 text-sm text-slate-400">
          <svg
            className="h-4.5 w-4.5 text-indigo-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="line-clamp-1">{event.venue}</span>
        </div>

        {/* Link / CTA */}
        <div className="mt-6">
          <Link
            to={`/events/${event.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 transition-all duration-200"
          >
            Get Tickets
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
