import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.board.create({
    data: {
      name: 'discoboard',
    },
  });

  await prisma.user.create({
    data: {
      username: 'alice',
      role: UserRole.MEMBER,
      password: 'password123',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
