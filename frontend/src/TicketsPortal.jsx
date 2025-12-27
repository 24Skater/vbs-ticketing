import { useState } from "react";
import hero from "./assets/hero.png";
import TicketForm from "./TicketForm";
import ViewTicket from "./ViewTicket";
import { Button } from "./components/ui";
import "./App.css";

export default function TicketsPortal() {
  const [mode, setMode] = useState("none"); // none | generate | view

  return (
    <div className="ticket-preview-page" style={{ backgroundImage: `url(${hero})` }}>
      <div className="ticket-preview-overlay">
        <div className="ticket-preview-container">
          <div className="ticket-card" style={{ maxWidth: 1024, width: "100%" }}>
            <div className="ticket-card-header">
              <span className="ticket-season">Tickets Portal</span>
              <h1 className="ticket-title">VBS 2025</h1>
              <p className="ticket-subtitle">
                {mode === "none" && "Select what you want to do"}
                {mode === "generate" && "Generate your ticket with payment"}
                {mode === "view" && "View your existing ticket"}
              </p>
            </div>

            {mode === "none" && (
              <div 
                className="portal-buttons"
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
                  gap: 20, 
                  width: "100%",
                  padding: "20px 0"
                }}
              >
                <button 
                  className="portal-card" 
                  onClick={() => setMode("generate")}
                  aria-label="Generate a new ticket"
                >
                  <span className="portal-card-icon" aria-hidden="true">🎫</span>
                  <span className="portal-card-title">Generate Ticket</span>
                  <span className="portal-card-desc">Pay and get your ticket</span>
                </button>
                <button 
                  className="portal-card" 
                  onClick={() => setMode("view")}
                  aria-label="View your existing ticket"
                >
                  <span className="portal-card-icon" aria-hidden="true">👁️</span>
                  <span className="portal-card-title">View Ticket</span>
                  <span className="portal-card-desc">Check your ticket status</span>
                </button>
              </div>
            )}

            {mode === "generate" && (
              <div role="region" aria-label="Ticket generation form">
                <TicketForm />
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <Button 
                    variant="ghost" 
                    onClick={() => setMode("none")}
                    aria-label="Go back to main menu"
                  >
                    ← Back to Menu
                  </Button>
                </div>
              </div>
            )}

            {mode === "view" && (
              <div role="region" aria-label="Ticket viewing form">
                <ViewTicket />
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <Button 
                    variant="ghost" 
                    onClick={() => setMode("none")}
                    aria-label="Go back to main menu"
                  >
                    ← Back to Menu
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="footer" role="contentinfo">
        <p>Powered by OxTech Studio</p>
      </footer>
    </div>
  );
}
