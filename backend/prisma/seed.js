require('dotenv').config();

const bcrypt = require('bcrypt');
const { PrismaClient, Role } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the Prisma seed.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const johnWorkingHours = {
  mon: ['09:00', '17:00'],
  tue: ['09:00', '17:00'],
  wed: ['09:00', '17:00'],
  thu: ['09:00', '17:00'],
  fri: ['09:00', '17:00'],
};

const sarahWorkingHours = {
  mon: ['10:00', '18:00'],
  tue: ['10:00', '18:00'],
  wed: ['10:00', '18:00'],
  thu: ['10:00', '18:00'],
  fri: ['10:00', '18:00'],
};

async function upsertDoctor({ name, email, password, specialization, slotDuration, workingHours }) {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: { name, email, passwordHash, role: Role.DOCTOR },
    update: { name, passwordHash, role: Role.DOCTOR },
  });

  await prisma.doctor.upsert({
    where: { userId: user.id },
    create: { userId: user.id, specialization, slotDuration, workingHours },
    update: { specialization, slotDuration, workingHours },
  });
}

async function main() {
  const [adminPasswordHash, patientPasswordHash] = await Promise.all([
    bcrypt.hash('admin123', 12),
    bcrypt.hash('patient123', 12),
  ]);

  await prisma.user.upsert({
    where: { email: 'admin@clinic.com' },
    create: {
      name: 'Admin',
      email: 'admin@clinic.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    update: { name: 'Admin', passwordHash: adminPasswordHash, role: Role.ADMIN },
  });

  await upsertDoctor({
    name: 'Dr. John Smith',
    email: 'john@clinic.com',
    password: 'doctor123',
    specialization: 'Cardiologist',
    slotDuration: 30,
    workingHours: johnWorkingHours,
  });

  await upsertDoctor({
    name: 'Dr. Sarah Lee',
    email: 'sarah@clinic.com',
    password: 'doctor123',
    specialization: 'Dermatologist',
    slotDuration: 20,
    workingHours: sarahWorkingHours,
  });

  const patient = await prisma.user.upsert({
    where: { email: 'alice@gmail.com' },
    create: {
      name: 'Alice Brown',
      email: 'alice@gmail.com',
      passwordHash: patientPasswordHash,
      role: Role.PATIENT,
    },
    update: {
      name: 'Alice Brown',
      passwordHash: patientPasswordHash,
      role: Role.PATIENT,
    },
  });

  await prisma.patient.upsert({
    where: { userId: patient.id },
    create: { userId: patient.id },
    update: {},
  });
}

main()
  .then(() => console.log('Database seed completed successfully.'))
  .catch((error) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
