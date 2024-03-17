import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';
import BoardController from 'src/boards/BoardController';
import BoardRepository from 'src/boards/BoardRepository';
import BoardService from 'src/boards/BoardService';
import { createBoard } from 'src/boards/routes/createBoard';
import { getBoardPosts } from 'src/boards/routes/getBoardPosts';

/**
 * Boards route.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const boards = (prisma: PrismaClient) => {
  const app = new Elysia();

  const boardRepository = new BoardRepository(prisma);
  const boardService = new BoardService(boardRepository);
  const boardController = new BoardController(boardService);

  app.use(createBoard(boardController)).use(getBoardPosts(boardController));

  return app;
};
