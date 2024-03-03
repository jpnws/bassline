import pg from 'pg';

import request from 'supertest';

import { v4 as uuidv4 } from 'uuid';

import { execSync } from 'child_process';

import { createApp } from 'src/app';
import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

export default class Helper {
  dbName: string;
  dbUrl: string;
  configWithoutDb: pg.ClientConfig;
  app: Elysia | null;
  prisma: PrismaClient | null;
  url: string;

  constructor() {
    this.dbName = uuidv4();

    this.configWithoutDb = {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      ssl: Boolean(process.env.DB_SSL),
    };

    this.dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${
      process.env.DB_HOST
    }:${process.env.DB_PORT}/${this.dbName}?sslmode=${
      process.env.DB_SSL ? 'require' : 'disable'
    }&schema=public`;

    this.app = null;
    this.prisma = null;
    this.url = '';
  }

  async spawnApp() {
    // Create a test database.
    const connectionWithoutDb = new pg.Client(this.configWithoutDb);
    await connectionWithoutDb.connect();
    try {
      await connectionWithoutDb.query(`CREATE DATABASE "${this.dbName}";`);
      // console.log("Database created.");
    } catch (error) {
      console.error(`Failed to create a test database: ${this.dbName}`);
      console.error(error);
      throw error;
    } finally {
      await connectionWithoutDb.end();
    }

    // Run Prisma migrations.
    try {
      execSync(`DATABASE_URL="${this.dbUrl}" bunx prisma migrate deploy`);
      // console.log("Migration successful.");
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }

    // Create a new instance of PrsimaClient.
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.dbUrl,
        },
      },
    });

    // Establish a Prisma connection.
    await prisma.$connect();

    // Create an instance of the app.
    const app = createApp(prisma);

    // Start listening on the host and a dynamically chosen port.
    await new Promise((resolve) => {
      app.listen({ hostname: process.env.APP_HOST, port: 0 }, () => {
        resolve(null);
      });
    });

    // Stop the server and close prisma if server is null.
    if (!app.server) {
      await app.stop();
      await prisma.$disconnect();
      throw new Error('Server failed to start.');
    }

    this.app = app;
    this.prisma = prisma;
    this.url = `http://${app.server.hostname}:${app.server.port}`;
  }

  /**
   * Drop the test database.
   */
  async dropDb() {
    const client = new pg.Client(this.configWithoutDb);
    await client.connect();
    try {
      await client.query(`DROP DATABASE "${this.dbName}"`);
      // console.log("Data base dropped.");
    } catch (error) {
      console.error(`Failed to drop database: ${this.dbName}`);
      console.error(error);
      throw error;
    } finally {
      await client.end();
    }
  }

  async getBoards() {
    const res = await request(this.url).get('/boards');
    return res;
  }

  async createBoard(board: { name: string }) {
    const res = await request(this.url).post('/boards').send(board);
    return res;
  }

  async createUser(user: { username: string; password: string }) {
    const res = await request(this.url).post('/users').send(user);
    return res;
  }

  async createPost(post: {
    subject: string;
    text: string;
    boardId: number;
    userId: number;
  }) {
    const res = await request(this.url).post('/posts').send(post);
    return res;
  }

  async getPost(postId: number) {
    const res = await request(this.url).get(`/posts/${postId}`);
    return res;
  }

  async getPostsByBoardId(boardId: number) {
    const res = await request(this.url).get(`/boards/${boardId}/posts`);
    return res;
  }

  async updatePost(
    id: number,
    post: {
      subject: string;
      text: string;
      boardId: number;
      userId: number;
    }
  ) {
    const res = await request(this.url).put(`/posts/${id}`).send(post);
    return res;
  }

  async deletePost(id: number) {
    const res = await request(this.url).delete(`/posts/${id}`);
    return res;
  }

  async createComment(comment: {
    text: string;
    postId: number;
    userId: number;
  }) {
    const res = await request(this.url).post('/comments').send(comment);
    return res;
  }

  async updateComment(
    id: number,
    comment: {
      text: string;
      postId: number;
      userId: number;
    }
  ) {
    const res = await request(this.url).put(`/comments/${id}`).send(comment);
    return res;
  }

  async getComment(id: number) {
    const res = await request(this.url).get(`/comments/${id}`);
    return res;
  }

  async deleteComment(id: number) {
    const res = await request(this.url).delete(`/comments/${id}`);
    return res;
  }

  async getCommentsByPostId(id: number) {
    const res = await request(this.url).get(`/posts/${id}/comments`);
    return res;
  }
}
