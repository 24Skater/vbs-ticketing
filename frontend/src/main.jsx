import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/ThemeProvider";
import "./lib/i18n"; // Initialize i18n
import "./index.css";

// Public Pages
import { Home, Events, EventDetails, Checkout, TicketLookup } from "./pages";
import TicketPreview from "./TicketPreview.jsx";

// Admin Module
import AdminLayout from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Tickets from "./admin/pages/Tickets";
import AdminEvents from "./admin/pages/Events";
import Reports from "./admin/pages/Reports";
import Users from "./admin/pages/Users";
import ActivityLogs from "./admin/pages/ActivityLogs";
import Settings from "./admin/pages/Settings";
import Login from "./admin/pages/Login";

// Auth guard component
function RequireAuth({ children }) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/view" element={<TicketLookup />} />
            <Route path="/tickets" element={<TicketLookup />} />
            <Route path="/ticket/:ticketId" element={<TicketPreview />} />

            {/* ===== ADMIN ROUTES ===== */}
            <Route path="/admin/login" element={<Login />} />
            
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="reports" element={<Reports />} />
              <Route path="users" element={<Users />} />
              <Route path="logs" element={<ActivityLogs />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
