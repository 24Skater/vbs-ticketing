import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { useTicket } from "./hooks/useTickets";
import { Button, Alert, Spinner } from "./components/ui";
import hero from "./assets/hero.png";
import "./App.css";

export default function TicketPreview() {
  const { ticketId = "" } = useParams();
  const ticketCode = useMemo(() => decodeURIComponent(ticketId || ""), [ticketId]);
  const [qrImage, setQrImage] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const location = useLocation();
  const params = new URLSearchParams(location.search || "");
  const fromVerify = params.get("verified") === "1";
  const wasUsed = params.get("used") === "1";
  const invalid = params.get("invalid") === "1";

  // Fetch ticket data
  const { data: ticketData, isLoading, error } = useTicket(ticketCode);
  const ticket = ticketData?.data;

  // Generate QR code when ticket loads
  useEffect(() => {
    if (!ticket) return;
    
    const qrData = `VBS:${ticket.ticketId}:${ticket.accessCode}`;
    QRCode.toDataURL(qrData, { margin: 1, scale: 7 })
      .then(setQrImage)
      .catch(() => setQrImage(""));
    
    // Show confetti animation
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 1200);
    return () => clearTimeout(timer);
  }, [ticket]);

  const handleDownloadPDF = () => {
    if (!ticket?.ticketId) return;
    window.open(`/api/tickets/${encodeURIComponent(ticket.ticketId)}/pdf`, "_blank");
  };

  const InfoRow = ({ label, value }) => (
    <div className="ticket-field" role="group" aria-label={label}>
      <span className="ticket-label" id={`label-${label.replace(/\s+/g, '-').toLowerCase()}`}>
        {label}
      </span>
      <span 
        className="ticket-value" 
        aria-labelledby={`label-${label.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {value || "—"}
      </span>
    </div>
  );

  const ticketType = ticket?.ticketType || "Regular";
  let ticketStatus = (ticket?.status || "Paid").toString();
  if (ticket?.used || wasUsed) {
    ticketStatus = "Used";
  } else if (fromVerify) {
    ticketStatus = "Active";
  }
  
  const statusLower = ticketStatus.toLowerCase();
  let statusClass = "ticket-status-pill";
  if (statusLower.includes("paid") || statusLower.includes("success")) {
    statusClass += " ticket-status-pill--paid";
  } else if (statusLower.includes("pending")) {
    statusClass += " ticket-status-pill--pending";
  } else if (statusLower.includes("cancel") || statusLower.includes("invalid")) {
    statusClass += " ticket-status-pill--cancelled";
  }
  
  const typeClass = `ticket-type-pill ${ticketType === "VIP" ? "ticket-type-pill--vip" : "ticket-type-pill--regular"}`;

  return (
    <main 
      className="ticket-preview-page" 
      style={{ backgroundImage: `url(${hero})` }}
      role="main"
      aria-label="Ticket preview"
    >
      <div className="ticket-preview-overlay">
        <div className="ticket-preview-container">
          {/* Loading State */}
          {isLoading && (
            <div className="ticket-card ticket-card--loading" role="status" aria-live="polite">
              <Spinner size="lg" />
              <p style={{ marginTop: 16 }}>Loading ticket...</p>
            </div>
          )}

          {/* Error State */}
          {(error || invalid || wasUsed) && !isLoading && (
            <div className="ticket-card ticket-card--error" role="alert">
              <h2>⚠️ Ticket Issue</h2>
              {invalid && <Alert variant="error">This ticket is invalid.</Alert>}
              {wasUsed && <Alert variant="warning">This ticket has already been used.</Alert>}
              {error && !invalid && !wasUsed && (
                <Alert variant="error">
                  {error.message || "We could not find that ticket. Please check your link or contact support."}
                </Alert>
              )}
              <Button 
                variant="secondary" 
                onClick={() => window.location.href = "/"}
                style={{ marginTop: 16 }}
              >
                ← Back to Home
              </Button>
            </div>
          )}

          {/* Ticket Display */}
          {ticket && !error && (
            <div 
              className={`ticket-flip ${flipped ? "ticket-flip--flipped" : ""}`}
              aria-label="Ticket card, click to flip for more details"
            >
              <div className="ticket-flip-inner">
                {/* Front of Ticket */}
                <article className="ticket-card ticket-card--front" aria-label="Ticket front">
                  {/* Confetti Animation */}
                  {showConfetti && (
                    <div className="ticket-confetti-overlay" aria-hidden="true">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <span
                          key={i}
                          className="ticket-confetti-piece"
                          style={{
                            left: `${(i / 18) * 100}%`,
                            background: i % 3 === 0 ? "#facc15" : i % 3 === 1 ? "#22c55e" : "#3b82f6",
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Header */}
                  <header className="ticket-card-header">
                    <span className="ticket-season">Digital Pass</span>
                    <h1 className="ticket-title">Vacation Bible School 2025</h1>
                    <p className="ticket-subtitle">ICS Pakyi No. 2</p>
                    
                    <div className="ticket-badges-row" role="group" aria-label="Ticket status">
                      <span className={typeClass} aria-label={`Ticket type: ${ticketType}`}>
                        {ticketType}
                      </span>
                      <span className={statusClass} aria-label={`Status: ${ticketStatus}`}>
                        <span className="ticket-status-dot" aria-hidden="true" />
                        {ticketStatus}
                      </span>
                    </div>

                    {fromVerify && (
                      <Alert variant="success" className="mt-2">
                        ✓ Ticket Verified Successfully
                      </Alert>
                    )}
                  </header>

                  {/* Content */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <section className="ticket-grid" style={{ flex: 1, minWidth: 260 }}>
                      <InfoRow label="Event" value="Vacation Bible School 2025 (VBS)" />
                      <InfoRow label="Venue" value="ICS Pakyi No. 2" />
                      <InfoRow 
                        label="Event Date" 
                        value={`${ticket?.eventDate || "27th December 2025"} · ${ticket?.eventTime || "09:00 AM"}`} 
                      />
                      <InfoRow label="Full Name" value={ticket?.name} />
                      <InfoRow label="Phone Number" value={formatPhone(ticket?.phone)} />
                      <InfoRow label="Ticket Type" value={ticket?.ticketType} />
                      <InfoRow label="Ticket ID" value={ticket?.ticketId} />
                      <InfoRow label="Status" value={ticket?.status || "—"} />
                      <InfoRow 
                        label="Amount" 
                        value={ticket?.amount ? `GHS ${(ticket.amount / 100).toFixed(2)}` : "—"} 
                      />
                      <InfoRow 
                        label="Issued On" 
                        value={ticket?.createdAt ? new Date(ticket.createdAt).toLocaleString() : "—"} 
                      />
                      {!fromVerify && <InfoRow label="Access Code" value={ticket?.accessCode} />}
                    </section>

                    {/* QR Code Section */}
                    <aside 
                      className="ticket-qr-section" 
                      style={{ minWidth: 200, flex: "0 0 200px", marginTop: 0 }}
                      aria-label="QR code for verification"
                    >
                      <div className="ticket-qr-box">
                        {qrImage ? (
                          <img 
                            src={qrImage} 
                            alt={`QR code to verify ticket ${ticket?.ticketId}`}
                            style={{ width: "100%", height: "auto" }}
                          />
                        ) : (
                          <span className="ticket-qr-fallback">QR unavailable</span>
                        )}
                      </div>
                      <p className="ticket-qr-hint">
                        Present this QR code at entrance
                      </p>
                    </aside>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                    {!fromVerify && (
                      <Button onClick={handleDownloadPDF} disabled={!ticket?.ticketId}>
                        📥 Download PDF
                      </Button>
                    )}
                    <Button 
                      variant="ghost"
                      onClick={() => setFlipped((v) => !v)}
                      aria-label={flipped ? "Show ticket front" : "Show more details"}
                    >
                      {flipped ? "← Back to Ticket" : "More Details →"}
                    </Button>
                  </div>
                </article>

                {/* Back of Ticket */}
                <article className="ticket-card ticket-card--back" aria-label="Ticket back">
                  <header className="ticket-card-header">
                    <span className="ticket-season">Event Info</span>
                    <h2 className="ticket-title">Vacation Bible School 2025</h2>
                    <p className="ticket-subtitle">Additional details</p>
                  </header>
                  <section className="ticket-grid">
                    <InfoRow label="Location" value="ICS Pakyi No. 2" />
                    <InfoRow label="Gates Open" value="8:30 AM" />
                    <InfoRow label="What to Bring" value="Bible, notebook, pen" />
                    <InfoRow label="Contact" value="For support, contact the organizers." />
                    <InfoRow 
                      label="Terms" 
                      value="This ticket admits one person and is non-transferable. Present your QR code at the gate." 
                    />
                  </section>
                  <Button 
                    variant="ghost"
                    onClick={() => setFlipped(false)}
                    style={{ marginTop: 16 }}
                  >
                    ← Back to Ticket
                  </Button>
                </article>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="footer" role="contentinfo">
        <p>Powered by OxTech Studio</p>
      </footer>
    </main>
  );
}

// Helper to format phone for display
function formatPhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("233")) {
    return `0${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return phone;
}
