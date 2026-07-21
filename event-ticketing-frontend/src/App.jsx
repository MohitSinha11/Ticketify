import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import MyTickets from "./pages/MyTickets";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import EventForm from "./pages/EventForm";
import StaffDashboard from "./pages/StaffDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events/:eventId" element={<EventDetails />} />

          {/* Purchaser Protected Routes */}
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />

          {/* Organizer Protected Routes */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute requiredRole="ORGANIZER">
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/create"
            element={
              <ProtectedRoute requiredRole="ORGANIZER">
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/edit/:eventId"
            element={
              <ProtectedRoute requiredRole="ORGANIZER">
                <EventForm />
              </ProtectedRoute>
            }
          />

          {/* Staff Protected Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute requiredRole="STAFF">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;