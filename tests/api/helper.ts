import pg from 'pg';

import request from 'supertest';

import { v4 as uuidv4 } from 'uuid';

import { execSync } from 'child_process';

import { createApp } from 'src/app';
import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Helper class for testing the API.
 *
 * The Helper class is a utility class that provides methods to interact with
 * the API endpoints. It also provides methods to create and drop the test
 * database, and to start and stop the app server.
 */
export default class Helper {
  dbName: string;
  dbUrl: string;
  configWithoutDb: pg.ClientConfig;
  app: Elysia<'/api'> | null;
  prisma: PrismaClient | null;
  url: string;

  constructor() {
    // A unique name for the test database.
    this.dbName = uuidv4();

    // Configuration object for pg connection without specifying database.
    this.configWithoutDb = {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      ssl: Boolean(process.env.DB_SSL),
    };

    // A connection string for the test database.
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
    this.url = `http://${app.server.hostname}:${app.server.port}/api`;
  }

  /**
   * Drop the test database.
   */
  async dropDb() {
    const client = new pg.Client(this.configWithoutDb);
    await client.connect();
    try {
      await client.query(`DROP DATABASE "${this.dbName}"`);
    } catch (error) {
      console.error(`Failed to drop database: ${this.dbName}`);
      console.error(error);
      throw error;
    } finally {
      await client.end();
    }
  }

  async getBoards() {
    return await request(this.url).get('/boards');
  }

  async createBoard(board: { name: string }) {
    return await request(this.url).post('/boards').send(board);
  }

  async createPost(post: PostBody, headers?: { [key: string]: string } | {}) {
    let req = request(this.url).post(`/posts`);
    req = headers ? req.set(headers) : req;
    return await req.send(post);
  }

  async getPost(postId: number, headers?: { [key: string]: string } | {}) {
    let req = request(this.url).get(`/posts/${postId}`);
    req = headers ? req.set(headers) : req;
    return await req.send();
  }

  async getPostsByBoardId(boardId: number) {
    return await request(this.url).get(`/boards/${boardId}/posts`);
  }

  async updatePost(
    postId: number,
    post: PostBody,
    headers?: { [key: string]: string } | {}
  ) {
    let req = request(this.url).put(`/posts/${postId}`);
    req = headers ? req.set(headers) : req;
    return await req.send(post);
  }

  async deletePost(postId: number, headers?: { [key: string]: string } | {}) {
    let req = request(this.url).delete(`/posts/${postId}`);
    req = headers ? req.set(headers) : req;
    return await req.send();
  }

  async createComment(
    comment: CommentBody,
    headers?: { [key: string]: string } | {}
  ) {
    let req = request(this.url).post(`/comments`);
    req = headers ? req.set(headers) : req;
    return await req.send(comment);
  }

  async updateComment(
    commentId: number,
    comment: CommentBody,
    headers?: { [key: string]: string } | {}
  ) {
    let req = request(this.url).put(`/comments/${commentId}`);
    req = headers ? req.set(headers) : req;
    return await req.send(comment);
  }

  async getComment(
    commentId: number,
    headers?: { [key: string]: string } | {}
  ) {
    let req = request(this.url).get(`/comments/${commentId}`);
    req = headers ? req.set(headers) : req;
    return await req.send();
  }

  async deleteComment(
    commentId: number,
    headers?: { [key: string]: string } | {}
  ) {
    let req = request(this.url).delete(`/comments/${commentId}`);
    req = headers ? req.set(headers) : req;
    return await req.send();
  }

  async getPostComments(id: number) {
    return await request(this.url).get(`/posts/${id}/comments`);
  }

  async createUser(user: { username: string; password: string }) {
    return await request(this.url).post('/users').send(user);
  }

  async getUser(id: number) {
    return await request(this.url).get(`/users/${id}`);
  }

  async deleteUser(id: number) {
    return await request(this.url).delete(`/users/${id}`);
  }

  async updateUser(id: number, user: UserBody) {
    return await request(this.url).put(`/users/${id}`).send(user);
  }

  async signUpUser(user: UserBody, headers?: { [key: string]: string } | {}) {
    let req = request(this.url).post(`/auth/signup`);
    req = headers ? req.set(headers) : req;
    return await req.send(user);
  }

  async signInUser(user: UserBody) {
    return await request(this.url).post(`/auth/signin`).send(user);
  }

  async signOutUser(headers?: { [key: string]: string } | {}) {
    let req = request(this.url).post(`/auth/signout`);
    req = headers ? req.set(headers) : req;
    return await req.send();
  }
}
