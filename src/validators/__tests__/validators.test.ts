import { describe, it, expect } from 'vitest';
import { 
  loginSchema, 
  registerSchema 
} from '../auth.validator';
import {
  createTicketSchema,
  searchTicketsSchema,
  lookupTicketSchema,
} from '../ticket.validator';

describe('Validators', () => {
  describe('Auth Validators', () => {
    describe('loginSchema', () => {
      it('should validate correct login data', () => {
        const result = loginSchema.safeParse({
          email: 'user@example.com',
          password: 'password123',
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject invalid email', () => {
        const result = loginSchema.safeParse({
          email: 'invalid-email',
          password: 'password123',
        });
        
        expect(result.success).toBe(false);
      });

      it('should require password', () => {
        const result = loginSchema.safeParse({
          email: 'user@example.com',
        });
        
        expect(result.success).toBe(false);
      });
    });

    describe('registerSchema', () => {
      it('should validate correct registration data', () => {
        // Password must have: uppercase, lowercase, number, special char, min 8 chars
        const result = registerSchema.safeParse({
          email: 'newuser@example.com',
          password: 'SecureP@ss123',
          name: 'New User',
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject weak password', () => {
        const result = registerSchema.safeParse({
          email: 'newuser@example.com',
          password: 'weak',
          name: 'New User',
        });
        
        expect(result.success).toBe(false);
      });

      it('should require name', () => {
        const result = registerSchema.safeParse({
          email: 'newuser@example.com',
          password: 'SecureP@ss123',
        });
        
        expect(result.success).toBe(false);
      });

      it('should default role to STAFF', () => {
        const result = registerSchema.safeParse({
          email: 'newuser@example.com',
          password: 'SecureP@ss123',
          name: 'New User',
        });
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.role).toBe('STAFF');
        }
      });
    });
  });

  describe('Ticket Validators', () => {
    describe('createTicketSchema', () => {
      it('should validate correct ticket data', () => {
        const result = createTicketSchema.safeParse({
          name: 'John Doe',
          phone: '0241234567',
          amount: 30000,
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject missing name', () => {
        const result = createTicketSchema.safeParse({
          phone: '0241234567',
          amount: 30000,
        });
        
        expect(result.success).toBe(false);
      });

      it('should reject short name', () => {
        const result = createTicketSchema.safeParse({
          name: 'J',
          phone: '0241234567',
          amount: 30000,
        });
        
        expect(result.success).toBe(false);
      });
    });

    describe('searchTicketsSchema', () => {
      it('should validate search params with defaults', () => {
        const result = searchTicketsSchema.safeParse({});
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.page).toBe(1);
          // limit default might vary
          expect(typeof result.data.limit).toBe('number');
        }
      });

      it('should validate with custom params', () => {
        const result = searchTicketsSchema.safeParse({
          query: 'john',
          status: 'PAID',
          page: 2,
          limit: 50,
        });
        
        expect(result.success).toBe(true);
      });
    });

    describe('lookupTicketSchema', () => {
      it('should validate lookup data', () => {
        const result = lookupTicketSchema.safeParse({
          phone: '0241234567',
          accessCode: 'ABC12',
        });
        
        expect(result.success).toBe(true);
      });

      it('should reject missing accessCode', () => {
        const result = lookupTicketSchema.safeParse({
          phone: '0241234567',
        });
        
        expect(result.success).toBe(false);
      });
    });
  });
});
