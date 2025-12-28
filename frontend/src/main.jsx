import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/ThemeProvider";
import "./index.css";

// New Modern Pages
import { Home, Events, EventDetails, Checkout, TicketLookup } from "./pages";

// Legacy pages (will be deprecated)
import Admin from "./Admin.jsx";
import TicketPreview from "./TicketPreview.jsx";

// Admin pages
import Branding from "./admin/pages/Branding.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/view" element={<TicketLookup />} />
            <Route path="/tickets" element={<TicketLookup />} />
            
            {/* Legacy ticket preview (still needed) */}
            <Route path="/ticket/:ticketId" element={<TicketPreview />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/branding" element={<Branding />} />
            
            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
