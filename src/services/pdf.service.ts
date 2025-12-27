import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { PassThrough } from 'stream';
import type { TicketData } from '../types/index.js';

/**
 * Generate QR code as data URL
 */
async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 200,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Generate a PDF ticket
 */
export async function generateTicketPDF(ticket: TicketData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [400, 600],
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const chunks: Buffer[] = [];
      const stream = new PassThrough();

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);

      doc.pipe(stream);

      // Colors
      const primaryColor = '#4F46E5';
      const textColor = '#1F2937';
      const mutedColor = '#6B7280';

      // Header
      doc
        .fillColor(primaryColor)
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('VBS 2025', { align: 'center' });

      doc
        .fontSize(12)
        .fillColor(mutedColor)
        .font('Helvetica')
        .text('Vacation Bible School', { align: 'center' });

      doc.moveDown(1.5);

      // Divider
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(40, doc.y)
        .lineTo(360, doc.y)
        .stroke();

      doc.moveDown(1);

      // QR Code
      const qrData = `VBS:${ticket.ticketId}:${ticket.accessCode}`;
      const qrDataUrl = await generateQRCode(qrData);
      const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      
      doc.image(qrBuffer, 125, doc.y, { width: 150 });
      doc.moveDown(0.5);
      doc.y += 150;

      // Ticket ID
      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(ticket.ticketId, { align: 'center' });

      doc.moveDown(0.5);

      // Access Code
      doc
        .fillColor(textColor)
        .fontSize(14)
        .font('Helvetica')
        .text(`Access Code: ${ticket.accessCode}`, { align: 'center' });

      doc.moveDown(1.5);

      // Divider
      doc
        .strokeColor('#E5E7EB')
        .lineWidth(1)
        .moveTo(40, doc.y)
        .lineTo(360, doc.y)
        .stroke();

      doc.moveDown(1);

      // Attendee Details
      const details = [
        { label: 'Name', value: ticket.name },
        { label: 'Phone', value: formatPhone(ticket.phone) },
        { label: 'Type', value: ticket.ticketType },
        { label: 'Date', value: ticket.eventDate },
        { label: 'Time', value: ticket.eventTime },
      ];

      for (const detail of details) {
        doc
          .fillColor(mutedColor)
          .fontSize(10)
          .font('Helvetica')
          .text(detail.label, 60, doc.y, { continued: true, width: 80 });
        
        doc
          .fillColor(textColor)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(detail.value, { align: 'right' });

        doc.moveDown(0.5);
      }

      doc.moveDown(1);

      // Status badge
      const statusColor = ticket.status === 'PAID' ? '#10B981' : 
                          ticket.status === 'USED' ? '#6B7280' : '#F59E0B';
      
      const statusText = ticket.status === 'PAID' ? '✓ CONFIRMED' :
                         ticket.status === 'USED' ? 'CHECKED IN' : ticket.status;

      doc
        .roundedRect(140, doc.y, 120, 30, 5)
        .fillColor(statusColor)
        .fill();

      doc
        .fillColor('#FFFFFF')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(statusText, 140, doc.y - 22, { width: 120, align: 'center' });

      doc.moveDown(2);

      // Footer
      doc
        .fillColor(mutedColor)
        .fontSize(8)
        .font('Helvetica')
        .text('Present this ticket at the venue entrance.', { align: 'center' })
        .text('Keep your access code safe for online verification.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format phone number for display
 */
function formatPhone(phone: string): string {
  if (phone.startsWith('233') && phone.length === 12) {
    return `0${phone.slice(3, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
  }
  return phone;
}

/**
 * Generate multiple tickets PDF (for bulk printing)
 */
export async function generateBulkTicketsPDF(tickets: TicketData[]): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 20, bottom: 20, left: 20, right: 20 },
      });

      const chunks: Buffer[] = [];
      const stream = new PassThrough();

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);

      doc.pipe(stream);

      // 2 tickets per page (A4 can fit 2 nicely)
      for (let i = 0; i < tickets.length; i++) {
        if (i > 0 && i % 2 === 0) {
          doc.addPage();
        }

        const ticket = tickets[i];
        const yOffset = (i % 2) * 380;

        await renderMiniTicket(doc, ticket, 20, 20 + yOffset);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Render a mini ticket on a page
 */
async function renderMiniTicket(
  doc: typeof PDFDocument.prototype,
  ticket: TicketData,
  x: number,
  y: number
): Promise<void> {
  const width = 555;
  const height = 360;

  // Border
  doc
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .rect(x, y, width, height)
    .stroke();

  // Header background
  doc
    .fillColor('#4F46E5')
    .rect(x, y, width, 50)
    .fill();

  // Header text
  doc
    .fillColor('#FFFFFF')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('VBS 2025', x + 20, y + 15, { width: width - 40 });

  doc
    .fontSize(10)
    .font('Helvetica')
    .text(ticket.ticketId, x + 20, y + 15, { width: width - 40, align: 'right' });

  // QR Code
  const qrData = `VBS:${ticket.ticketId}:${ticket.accessCode}`;
  const qrDataUrl = await generateQRCode(qrData);
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  
  doc.image(qrBuffer, x + width - 140, y + 70, { width: 120 });

  // Details
  const detailsX = x + 20;
  let detailsY = y + 70;

  doc
    .fillColor('#1F2937')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(ticket.name, detailsX, detailsY);

  detailsY += 25;

  doc
    .fillColor('#6B7280')
    .fontSize(11)
    .font('Helvetica')
    .text(`Phone: ${formatPhone(ticket.phone)}`, detailsX, detailsY);

  detailsY += 18;

  doc.text(`Type: ${ticket.ticketType}`, detailsX, detailsY);

  detailsY += 18;

  doc.text(`Date: ${ticket.eventDate}`, detailsX, detailsY);

  detailsY += 18;

  doc.text(`Time: ${ticket.eventTime}`, detailsX, detailsY);

  detailsY += 30;

  // Access Code (larger, prominent)
  doc
    .fillColor('#4F46E5')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`Access Code: ${ticket.accessCode}`, detailsX, detailsY);

  // Status
  const statusColor = ticket.status === 'PAID' ? '#10B981' : '#F59E0B';
  const statusText = ticket.status === 'PAID' ? 'CONFIRMED' : ticket.status;

  doc
    .fillColor(statusColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(statusText, x + 20, y + height - 40);

  // Footer line
  doc
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .moveTo(x, y + height - 50)
    .lineTo(x + width, y + height - 50)
    .stroke();
}

export default {
  generateTicketPDF,
  generateBulkTicketsPDF,
};

