const prisma = require('./src/config/db');

(async () => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      select: {
        id: true,
        name: true,
        email: true,
        patient: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
