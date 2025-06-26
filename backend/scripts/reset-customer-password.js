const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'bjmpotter@gmail.com';
  const newPassword = 'customer123';
  try {
    await prisma.$connect();
    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashed }
    });
    console.log(`Password for ${email} reset to '${newPassword}'`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword(); 