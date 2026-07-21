import api from "./api";

// Public Endpoints
export const getPublishedEvents = (q = "", page = 0, size = 12) => {
  const params = {
    page,
    size,
  };

  if (q && q.trim()) {
    params.q = q.trim();
  }

  return api.get("/published-events", { params });
};

export const getPublishedEventDetails = (eventId) =>
  api.get(`/published-events/${eventId}`);

// Organizer Endpoints (require ROLE_ORGANIZER)
export const listOrganizerEvents = (page = 0, size = 12) =>
  api.get("/events", {
    params: {
      page,
      size,
    },
  });

export const getOrganizerEvent = (eventId) => api.get(`/events/${eventId}`);

export const createEvent = (eventData) => api.post("/events", eventData);

export const updateEvent = (eventId, eventData) =>
  api.put(`/events/${eventId}`, eventData);

export const deleteEvent = (eventId) => api.delete(`/events/${eventId}`);