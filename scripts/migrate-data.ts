/**
 * Data Migration Script
 * 
 * Migrates data from legacy Payment table to new Ticket/Payment structure
 * 
 * Usage: npx tsx scripts/migrate-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LegacyPayment {
  id: number;
  name: string;
  phone: string;
  amount: number;
  status: string;
  reference: string | null;
  ticketType: string;
  ticketId: string;
  eventDate: string;
  eventTime: string;
  accessCode: string | null;
  used: boolean;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Check if legacy Payment table exists
 */
async function legacyTableExists(): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Payment'
      );
    `;
    return result[0]?.exists ?? false;
  } catch {
    return false;
  }
}

/**
 * Get legacy payments
 */
async function getLegacyPayments(): Promise<LegacyPayment[]> {
  try {
    return await prisma.$queryRaw<LegacyPayment[]>`
      SELECT * FROM "Payment" ORDER BY "createdAt" ASC
    `;
  } catch {
    console.log('No legacy Payment table found or empty');
    return [];
  }
}

/**
 * Convert legacy status to new TicketStatus enum
 */
function mapStatus(status: string): 'PENDING' | 'PAID' | 'USED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED' {
  const statusMap: Record<string, 'PENDING' | 'PAID' | 'USED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED'> = {
    'Paid': 'PAID',
    'paid': 'PAID',
    'PAID': 'PAID',
    'Pending': 'PENDING',
    'pending': 'PENDING',
    'PENDING': 'PENDING',
    'Used': 'USED',
    'used': 'USED',
    'USED': 'USED',
    'Cancelled': 'CANCELLED',
    'cancelled': 'CANCELLED',
    'CANCELLED': 'CANCELLED',
    'Refunded': 'REFUNDED',
    'refunded': 'REFUNDED',
    'REFUNDED': 'REFUNDED',
  };
  return statusMap[status] || 'PENDING';
}

/**
 * Migrate a single legacy payment to new structure
 */
async function migratePayment(legacy: LegacyPayment): Promise<boolean> {
  try {
    // Check if already migrated
    const existing = await prisma.ticket.findUnique({
      where: { ticketId: legacy.ticketId },
    });

    if (existing) {
      console.log(`  ⏭️  Ticket ${legacy.ticketId} already exists, skipping`);
      return true;
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketId: legacy.ticketId,
        accessCode: legacy.accessCode || legacy.ticketId.slice(-5),
        name: legacy.name,
        phone: legacy.phone,
        amount: legacy.amount,
        status: mapStatus(legacy.status),
        used: legacy.used,
        verifiedAt: legacy.verifiedAt,
        createdAt: legacy.createdAt,
        updatedAt: legacy.updatedAt,
      },
    });

    // Create associated payment record if there was a payment
    if (legacy.amount > 0 && legacy.status !== 'Pending') {
      await prisma.payment.create({
        data: {
          ticketId: ticket.id,
          amount: legacy.amount,
          status: legacy.status === 'Paid' || legacy.status === 'PAID' ? 'SUCCESS' : 'PENDING',
          provider: 'HUBTEL',
          reference: legacy.reference,
          customerMsisdn: legacy.phone,
          customerName: legacy.name,
          paidAt: legacy.createdAt,
          createdAt: legacy.createdAt,
          updatedAt: legacy.updatedAt,
        },
      });
    }

    console.log(`  ✅ Migrated ticket ${legacy.ticketId}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to migrate ${legacy.ticketId}:`, error);
    return false;
  }
}

/**
 * Main migration function
 */
async function migrate(): Promise<void> {
  console.log('🚀 Starting data migration...\n');

  // Check for legacy table
  const hasLegacy = await legacyTableExists();
  
  if (!hasLegacy) {
    console.log('ℹ️  No legacy "Payment" table found.');
    console.log('   This is expected for fresh installations.');
    console.log('   Migration complete - nothing to migrate.\n');
    return;
  }

  // Get legacy payments
  const legacyPayments = await getLegacyPayments();
  
  if (legacyPayments.length === 0) {
    console.log('ℹ️  Legacy table is empty. Nothing to migrate.\n');
    return;
  }

  console.log(`📊 Found ${legacyPayments.length} legacy payments to migrate\n`);

  let success = 0;
  let failed = 0;

  for (const payment of legacyPayments) {
    const result = await migratePayment(payment);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log('\n📈 Migration Summary:');
  console.log(`   ✅ Successfully migrated: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total processed: ${legacyPayments.length}`);

  if (failed === 0 && success > 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n⚠️  You can now safely rename or drop the legacy "Payment" table:');
    console.log('   ALTER TABLE "Payment" RENAME TO "legacy_payments";');
  }
}

// Run migration
migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

