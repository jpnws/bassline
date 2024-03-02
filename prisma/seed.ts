import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const board = await prisma.board.create({
    data: {
      name: 'discoboard',
    },
  });

  const user = await prisma.user.create({
    data: {
      username: 'alice',
      role: UserRole.MEMBER,
      password: 'password123',
    },
  });

  await prisma.post.createMany({
    data: [
      {
        subject: 'Hello, World! 1',
        text: 'This is my first post!',
        boardId: board.id,
        userId: user.id,
      },
      {
        subject: 'Hello, World! 2',
        text: 'This is my first post!',
        boardId: board.id,
        userId: user.id,
      },
      {
        subject: 'Hello, World! 3',
        text: 'This is my first post!',
        boardId: board.id,
        userId: user.id,
      },
    ],
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
