import { describe, it, expect } from 'vitest';
import { 
  generateTicketId, 
  generateAccessCode, 
  generatePaymentReference 
} from '../generators';

describe('Generator Utilities', () => {
  describe('generateTicketId', () => {
    it('should generate a ticket ID with VBS prefix', () => {
      const ticketId = generateTicketId();
      
      expect(ticketId).toMatch(/^VBS-[A-Z0-9]{6}$/);
    });

    it('should generate unique ticket IDs', () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        ids.add(generateTicketId());
      }
      
      expect(ids.size).toBe(100);
    });
  });

  describe('generateAccessCode', () => {
    it('should generate a 5-character access code', () => {
      const code = generateAccessCode();
      
      expect(code).toHaveLength(5);
      expect(code).toMatch(/^[A-Z0-9]{5}$/);
    });

    it('should generate unique access codes', () => {
      const codes = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        codes.add(generateAccessCode());
      }
      
      expect(codes.size).toBe(100);
    });
  });

  describe('generatePaymentReference', () => {
    it('should generate a payment reference with PAY prefix', () => {
      const ref = generatePaymentReference();
      
      expect(ref).toMatch(/^PAY-\d{8}-[A-Z0-9]{8}$/);
    });

    it('should include current date in reference', () => {
      const ref = generatePaymentReference();
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      
      expect(ref).toContain(today);
    });
  });
});

