import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "./index.css";
import App from "./App.jsx";
import Admin from "./Admin.jsx";
import TicketPreview from "./TicketPreview.jsx";
import ViewTicket from "./ViewTicket.jsx";
import TicketsPortal from "./TicketsPortal.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TicketsPortal />} />
          <Route path="/home" element={<App />} />
          <Route path="/ticket/:ticketId" element={<TicketPreview />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/tickets" element={<TicketsPortal />} />
          <Route path="/view" element={<ViewTicket />} />
          <Route path="*" element={<TicketsPortal />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
