import api from "./api";

// Purchaser Operations
export const purchaseTicket = (eventId, ticketTypeId) =>
  api.post(`/events/${eventId}/ticket-types/${ticketTypeId}/tickets`);

export const listMyTickets = (page = 0, size = 12) =>
  api.get("/tickets", {
    params: {
      page,
      size,
    },
  });

export const getTicketDetails = (ticketId) => api.get(`/tickets/${ticketId}`);

export const getTicketQrCodeBlobUrl = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}/qr-code`, {
    responseType: "blob",
  });
  return URL.createObjectURL(response.data);
};

// Staff Operations (require ROLE_STAFF)
export const validateTicket = (ticketId, method = "MANUAL") =>
  api.post("/ticket-validations", {
    id: ticketId,
    method: method, // MANUAL or QR_CODE
  });
