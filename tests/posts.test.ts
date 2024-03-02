import request from 'supertest';

import { describe, beforeEach, afterEach, it, expect } from 'bun:test';

import Helper from 'tests/helper';
import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';

describe('Posts API', () => {
  let helper: Helper;
  let app: Elysia;
  let hostname: string;
  let port: number;
  let prisma: PrismaClient;

  beforeEach(async () => {
    helper = new Helper();
    const spawn = await helper.spawnApp();
    app = spawn.app;
    hostname = spawn.hostname;
    port = spawn.port;
    prisma = spawn.prisma;
  });

  afterEach(async () => {
    await app.stop();
    await prisma.$disconnect();
    await helper.dropDb();
  });

  it('should create a board, user, and then a post', async () => {
    // * ========================
    // * Arrange
    // * ========================
    // Create a board.
    const boardResponse = await request(`http://${hostname}:${port}`)
      .post('/boards')
      .send({ name: 'Test board' })
      .expect('Content-Type', /json/)
      .expect(201);
    const { id: boardId } = boardResponse.body;
    // Create a user.
    const userResponse = await request(`http://${hostname}:${port}`)
      .post('/users')
      .send({ role: 'member', username: 'Test user', password: 'password' });
    const { id: userId } = userResponse.body;
    // * ========================
    // * Act
    // * ========================
    const response = await request(`http://${hostname}:${port}`)
      .post('/posts')
      .send({
        subject: 'Test post',
        text: 'This is a test post.',
        boardId: boardId,
        userId: userId,
      });
    // * ========================
    // * Assert
    // * ========================
    expect(response.status).toBe(201);
  });

  // it('should return multiple posts', async () => {
  //   // Arrange
  //   let posts = [
  //     {
  //       subject: 'Test post 1',
  //       text: 'This is a test post.',
  //       boardId: 1,
  //       userId: 1,
  //     },
  //     {
  //       subject: 'Test post 2',
  //       text: 'This is another test post.',
  //       boardId: 1,
  //       userId: 1,
  //     },
  //   ];
  //   for (const post of posts) {
  //     await request(`http://${hostname}:${port}/posts`)
  //       .post('/posts')
  //       .send(post)
  //       .expect('Content-Type', /json/)
  //       .expect(201);
  //   }
  //   // Act
  //   const response = await request(`http://${hostname}:${port}`)
  //     .get('/boards/1/posts')
  //     .expect('Content-Type', /json/)
  //     .expect(200);
  //   // Assert
  //   const res = response.body;
  //   for (let i = 0; i < posts.length; i++) {
  //     expect(res[i].subject).toBe(posts[i].subject);
  //     expect(res[i].text).toBe(posts[i].text);
  //     expect(res[i].boardId).toBe(posts[i].boardId);
  //     expect(res[i].userId).toBe(posts[i].userId);
  //   }
  // });
});
