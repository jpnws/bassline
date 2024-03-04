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
      hash: await Bun.password.hash('password'),
    },
  });

  const newPosts = [
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
  ];

  await prisma.post.createMany({
    data: newPosts,
  });

  const newComments = [
    {
      text: '1 This is a comment 1!',
      postId: 1,
      userId: 1,
    },
    {
      text: '2 This is a commen 2!',
      postId: 1,
      userId: 1,
    },
    {
      text: '3 This is a comment 3!',
      postId: 2,
      userId: 1,
    },
  ];

  await prisma.comment.createMany({
    data: newComments,
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
