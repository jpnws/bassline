import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

export const signin = (_prisma: PrismaClient) => {
  const app = new Elysia();

  app
    .guard({
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    })
    .use(
      jwt({
        name: 'jwt',
        secret: Bun.env.APP_JWT_SECRET,
      })
    )
    .use(cookie())
    .post('/signin', ({ body }) => {
      const { username, password } = body as {
        username: string;
        password: string;
      };
      console.log(username, password);
    });

  return app;
};
