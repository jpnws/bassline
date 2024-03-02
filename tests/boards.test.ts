import { describe, afterAll, it, expect, beforeAll } from 'bun:test';

import Helper from 'tests/helper';
import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';

describe('Boards API', () => {
  let helper: Helper;
  let app: Elysia;
  let hostname: string;
  let port: number;
  let prisma: PrismaClient;

  beforeAll(async () => {
    helper = new Helper();
    const spawn = await helper.spawnApp();
    app = spawn.app;
    hostname = spawn.hostname;
    port = spawn.port;
    prisma = spawn.prisma;
  });

  afterAll(async () => {
    await app.stop();
    await prisma.$disconnect();
    await helper.dropDb();
  });

  it('should create a single board', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newBoard = {
      name: 'test-board-name1',
    };
    // * ========================
    // * Act
    // * ========================
    const boardCreateResponse = await helper.createBoard(newBoard);
    // * ========================
    // * Assert
    // * ========================
    expect(boardCreateResponse.status).toBe(201);
    const board = boardCreateResponse.body;
    expect(board.name).toBe('test-board-name1');
  });

  it('should retrieve multiple boards', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newBoard1 = {
      name: 'test-board-name2',
    };
    const newBoard2 = {
      name: 'test-board-name3',
    };
    // * ========================
    // * Act
    // * ========================
    const createBoardResponse1 = await helper.createBoard(newBoard1);
    const createBoardResponse2 = await helper.createBoard(newBoard2);
    const getBoardsResponse = await helper.getBoards();
    // * ========================
    // * Assert
    // * ========================
    expect(createBoardResponse1.status).toBe(201);
    expect(createBoardResponse2.status).toBe(201);
    expect(getBoardsResponse.status).toBe(200);
    const boards = getBoardsResponse.body;
    expect(boards.length).toBe(3);
  });
});
