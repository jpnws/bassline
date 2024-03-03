import pg from 'pg';

import request from 'supertest';
import superagent from 'superagent';

import { v4 as uuidv4 } from 'uuid';

import { execSync } from 'child_process';

import { createApp } from 'src/app';
import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

type SpawnData = {
  app: Elysia;
  prisma: PrismaClient;
};

export default class Helper {
  dbName: string;
  dbUrl: string;
  configWithoutDb: pg.ClientConfig;
  hostname: string;
  port: number;

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

    this.hostname = '';
    this.port = 0;
  }

  async spawnApp(): Promise<SpawnData> {
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

    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.dbUrl,
        },
      },
    });

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

    this.hostname = app.server.hostname;
    this.port = app.server.port;

    return { app, prisma };
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

  async getBoards(): Promise<superagent.Response> {
    const res = await request(`http://${this.hostname}:${this.port}`).get(
      '/boards'
    );
    return res;
  }

  async createBoard(board: { name: string }): Promise<superagent.Response> {
    const res = await request(`http://${this.hostname}:${this.port}`)
      .post('/boards')
      .send(board);
    return res;
  }

  async createUser(user: {
    username: string;
    password: string;
  }): Promise<superagent.Response> {
    const res = await request(`http://${this.hostname}:${this.port}`)
      .post('/users')
      .send(user);
    return res;
  }

  async createPost(post: {
    subject: string;
    text: string;
    boardId: number;
    userId: number;
  }): Promise<superagent.Response> {
    const res = await request(`http://${this.hostname}:${this.port}`)
      .post('/posts')
      .send(post);
    return res;
  }

  async getPost(postId: number): Promise<superagent.Response> {
    const res = await request(`http://${this.hostname}:${this.port}`).get(
      `/posts/${postId}`
    );
    return res;
  }

  async getPostsByBoardId(boardId: number): Promise<superagent.Response> {
    const res = await request(`http://${this.hostname}:${this.port}`).get(
      `/boards/${boardId}/posts`
    );
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
  ): Promise<superagent.Response> {
    const res = await request(`http://${this.hostname}:${this.port}`)
      .put(`/posts/${id}`)
      .send(post);
    return res;
  }

  async deletePost(id: number): Promise<superagent.Response> {
    const res = await request(`http://${this.hostname}:${this.port}`).delete(
      `/posts/${id}`
    );
    return res;
  }
}
