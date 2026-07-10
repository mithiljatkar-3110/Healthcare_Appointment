const prisma = require("./src/config/db.js");

async function main() {
  try {
    console.log("Testing database...");

    const users = await prisma.user.findMany();

    console.log("Users:");
    console.log(users);

    const count = await prisma.$transaction(async (tx) => {
      return await tx.user.count();
    });

    console.log("Transaction successful!");
    console.log("User count:", count);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();