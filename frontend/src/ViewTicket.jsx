import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ticketsApi } from "./lib/api";
import { Button, Input, Alert, Spinner } from "./components/ui";
import QRCode from "qrcode";
import "./App.css";

export default function ViewTicket() {
  const [phone, setPhone] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [ticket, setTicket] = useState(null);
  const [qrImage, setQrImage] = useState("");

  // Lookup mutation
  const lookupMutation = useMutation({
    mutationFn: () => ticketsApi.lookup(phone, accessCode),
    onSuccess: (data) => {
      setTicket(data.data);
    },
  });

  const handleLookup = async (e) => {
    e.preventDefault();
    setTicket(null);
    lookupMutation.mutate();
  };

  const handleDownload = () => {
    if (!ticket?.ticketId) return;
    window.open(`/api/tickets/${encodeURIComponent(ticket.ticketId)}/pdf`, "_blank");
  };

  // Generate QR code when ticket changes
  useEffect(() => {
    async function makeQR() {
      if (!ticket?.ticketId) {
        setQrImage("");
        return;
      }
      try {
        const verifyData = `VBS:${ticket.ticketId}:${ticket.accessCode}`;
        const dataUrl = await QRCode.toDataURL(verifyData, { 
          margin: 1, 
          scale: 7,
          color: { dark: "#000000", light: "#ffffff" }
        });
        setQrImage(dataUrl);
      } catch {
        setQrImage("");
      }
    }
    makeQR();
  }, [ticket]);

  const Info = ({ label, value }) => (
    <div className="ticket-field">
      <span className="ticket-label">{label}</span>
      <span className="ticket-value">{value || "—"}</span>
    </div>
  );

  const ticketType = ticket?.ticketType || "Regular";
  let ticketStatus = (ticket?.status || "Paid").toString();
  if (ticket?.used) {
    ticketStatus = "USED";
  }

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s === "paid" || s === "success") return "#10B981";
    if (s === "used") return "#6B7280";
    if (s === "pending") return "#F59E0B";
    if (s.includes("cancel") || s.includes("refund")) return "#EF4444";
    return "#6B7280";
  };

  return (
    <div className="view-ticket-form">
      {/* Search Form */}
      <form onSubmit={handleLookup} style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. 0241234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            inputClassName="text-gray-900"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Input
            label="Access Code"
            type="text"
            placeholder="e.g. K4Z8M"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            required
            maxLength={5}
            inputClassName="text-gray-900 uppercase"
          />
        </div>
        <Button 
          type="submit" 
          loading={lookupMutation.isPending}
          disabled={!phone.trim() || !accessCode.trim()}
          className="w-full"
        >
          {lookupMutation.isPending ? "Searching..." : "Find Ticket"}
        </Button>
      </form>

      {/* Error */}
      {lookupMutation.isError && (
        <Alert variant="error" className="mb-4">
          {lookupMutation.error?.message || "Ticket not found. Please check your phone number and access code."}
        </Alert>
      )}

      {/* Ticket Display */}
      {ticket && (
        <div 
          className="ticket-display"
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: 20,
            marginTop: 16
          }}
        >
          {/* Status Badge */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: 16 
          }}>
            <span style={{
              background: ticketType === "VIP" ? "#8B5CF6" : "#3B82F6",
              color: "white",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600
            }}>
              {ticketType}
            </span>
            <span style={{
              background: getStatusColor(ticketStatus),
              color: "white",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "white",
                opacity: 0.7
              }} />
              {ticketStatus}
            </span>
          </div>

          {/* Ticket Info */}
          <div className="ticket-grid" style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(2, 1fr)", 
            gap: 12 
          }}>
            <Info label="Name" value={ticket.name} />
            <Info label="Phone" value={formatPhone(ticket.phone)} />
            <Info label="Ticket ID" value={ticket.ticketId} />
            <Info label="Access Code" value={ticket.accessCode} />
            <Info label="Amount" value={`GHS ${(ticket.amount / 100).toFixed(2)}`} />
            <Info label="Event" value={`${ticket.eventDate} • ${ticket.eventTime}`} />
          </div>

          {/* QR Code */}
          <div style={{ 
            textAlign: "center", 
            marginTop: 20,
            padding: 20,
            background: "white",
            borderRadius: 12
          }}>
            {qrImage ? (
              <img 
                src={qrImage} 
                alt={`QR code for ${ticket.ticketId}`}
                style={{ maxWidth: 200, margin: "0 auto" }}
              />
            ) : (
              <div style={{ padding: 20, color: "#6B7280" }}>
                <Spinner size="md" />
                <p>Generating QR code...</p>
              </div>
            )}
            <p style={{ color: "#6B7280", fontSize: 13, marginTop: 8 }}>
              Show this QR code at the entrance
            </p>
          </div>

          {/* Actions */}
          <div style={{ 
            display: "flex", 
            gap: 12, 
            marginTop: 16,
            flexWrap: "wrap"
          }}>
            <Button
              variant="primary"
              onClick={() => window.open(`/ticket/${encodeURIComponent(ticket.ticketId)}`, "_blank")}
            >
              Open Full Ticket
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownload}
            >
              Download PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to format phone
function formatPhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("233")) {
    return `0${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return phone;
}
