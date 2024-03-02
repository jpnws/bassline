import { Client, ClientConfig } from 'pg';

import { v4 as uuidv4 } from 'uuid';

import { execSync } from 'child_process';

import { createApp } from 'src/app';
import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

type SpawnData = {
  app: Elysia;
  hostname: string;
  port: number;
  prisma: PrismaClient;
};

export default class Helper {
  dbName: string;
  dbUrl: string;
  configWithoutDb: ClientConfig;

  /**
   * Create a new Helper object.
   * dbName: string - The name of the test database.
   * configWithoutDb: pg.ClientConfig - The configuration object for the PostgreSQL client without the database name.
   * configWithDb: pg.ClientConfig - The configuration object for the PostgreSQL client with the database name.
   * @returns {Helper} The new Helper object.
   */
  constructor() {
    this.dbName = uuidv4();

    this.configWithoutDb = {
      user: Bun.env.DB_USER,
      password: Bun.env.DB_PASS,
      host: Bun.env.DB_HOST,
      port: parseInt(Bun.env.DB_PORT),
      ssl: Boolean(Bun.env.DB_SSL),
    };

    this.dbUrl = `postgresql://${Bun.env.DB_USER}:${Bun.env.DB_PASS}@${
      Bun.env.DB_HOST
    }:${Bun.env.DB_PORT}/${this.dbName}?sslmode=${
      Bun.env.DB_SSL ? 'require' : 'disable'
    }&schema=public`;
  }

  /**
   * Create a new test database and tables, and start the app server.
   * @returns {Promise<{ server: http.Server, host: string, port: number, pool: pg.Pool }>}
   * The server object, host, port, and pool object.
   * The server object is the HTTP server.
   * The host is the host name or IP address.
   * The port is the port number.
   * The pool object is the PostgreSQL connection pool.
   */
  async spawnApp(): Promise<SpawnData> {
    // Create a test database.
    const connectionWithoutDb = new Client(this.configWithoutDb);
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
      app.listen({ hostname: Bun.env.APP_HOST, port: 0 }, () => {
        resolve(null);
      });
    });

    // Stop the server and close prisma if server is null.

    if (!app.server) {
      await prisma.$disconnect();
      throw new Error('Server failed to start.');
    }

    // Get the host name or IP address.
    const hostname = app.server.hostname;

    // Get the dynamically chosen port number.
    const port = app.server.port;

    return { app, hostname, port, prisma };
  }

  /**
   * Drop the test database.
   */
  async dropDb() {
    const client = new Client(this.configWithoutDb);
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
}
