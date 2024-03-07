import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

import { createBoard } from 'src/routes/boards/createBoard';
import { getBoardPosts } from 'src/routes/boards/getBoardPosts';
import { getBoards } from 'src/routes/boards/getBoards';

/**
 * Boards route.
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const boards = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.use(createBoard(prisma));
  app.use(getBoards(prisma));
  app.use(getBoardPosts(prisma));

  return app;
};
