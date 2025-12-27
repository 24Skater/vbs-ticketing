/**
 * Database Seed Script
 * 
 * Creates sample data for development and testing
 * 
 * Usage: npx tsx scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Create default admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vbs.local' },
    update: {},
    create: {
      email: 'admin@vbs.local',
      name: 'VBS Admin',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create a staff user
  const staffPassword = await bcrypt.hash('Staff123!', 12);
  
  const staff = await prisma.user.upsert({
    where: { email: 'staff@vbs.local' },
    update: {},
    create: {
      email: 'staff@vbs.local',
      name: 'VBS Staff',
      passwordHash: staffPassword,
      role: 'STAFF',
      isActive: true,
    },
  });
  console.log('✅ Created staff user:', staff.email);

  // Create a checker user
  const checkerPassword = await bcrypt.hash('Checker123!', 12);
  
  const checker = await prisma.user.upsert({
    where: { email: 'checker@vbs.local' },
    update: {},
    create: {
      email: 'checker@vbs.local',
      name: 'VBS Checker',
      passwordHash: checkerPassword,
      role: 'CHECKER',
      isActive: true,
    },
  });
  console.log('✅ Created checker user:', checker.email);

  // Create a sample event
  const event = await prisma.event.upsert({
    where: { slug: 'vbs-2025' },
    update: {},
    create: {
      name: 'VBS 2025',
      slug: 'vbs-2025',
      description: 'Vacation Bible School 2025',
      venue: 'Main Church Auditorium',
      eventDate: new Date('2025-12-27'),
      eventTime: '09:00 AM',
      isActive: true,
    },
  });
  console.log('✅ Created event:', event.name);

  // Create ticket types for the event
  const ticketTypes = [
    { name: 'Regular', price: 30000, quantity: 200, sortOrder: 1 },
    { name: 'VIP', price: 50000, quantity: 50, sortOrder: 2 },
    { name: 'Early Bird', price: 25000, quantity: 100, sortOrder: 0 },
  ];

  for (const tt of ticketTypes) {
    await prisma.ticketType.upsert({
      where: { eventId_name: { eventId: event.id, name: tt.name } },
      update: { price: tt.price, quantity: tt.quantity },
      create: {
        eventId: event.id,
        name: tt.name,
        price: tt.price,
        quantity: tt.quantity,
        sortOrder: tt.sortOrder,
        isActive: true,
      },
    });
    console.log(`✅ Created ticket type: ${tt.name} (GHS ${tt.price / 100})`);
  }

  // Create sample tickets
  const sampleTickets = [
    { name: 'John Doe', phone: '233241234567', amount: 30000 },
    { name: 'Jane Smith', phone: '233201234568', amount: 50000 },
    { name: 'Bob Wilson', phone: '233271234569', amount: 25000 },
  ];

  for (let i = 0; i < sampleTickets.length; i++) {
    const t = sampleTickets[i];
    const ticketId = `VBS-${String(i + 1).padStart(6, '0').slice(-6)}TEST${i}`.slice(0, 10).toUpperCase();
    const accessCode = `TEST${i}`.padStart(5, '0').slice(-5);
    
    await prisma.ticket.upsert({
      where: { ticketId },
      update: {},
      create: {
        ticketId,
        accessCode,
        name: t.name,
        phone: t.phone,
        amount: t.amount,
        status: 'PAID',
        eventId: event.id,
        createdById: admin.id,
      },
    });
    console.log(`✅ Created ticket: ${ticketId} for ${t.name}`);
  }

  console.log('\n🎉 Seeding completed!');
  console.log('\n📋 Login Credentials:');
  console.log('   Admin:   admin@vbs.local / Admin123!');
  console.log('   Staff:   staff@vbs.local / Staff123!');
  console.log('   Checker: checker@vbs.local / Checker123!');
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

