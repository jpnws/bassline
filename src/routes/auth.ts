import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

export const auth = (prisma: PrismaClient) => {
  const app = new Elysia({ prefix: '/auth' });

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
    .post(
      '/signup',
      async ({ body, set, jwt, cookie: { auth }, setCookie }) => {
        // * ================================================
        // * Check if user is already authenticated.
        // * ================================================
        if (auth) {
          set.status = 409;
          return {
            message: 'You are already authenticated.',
          };
        }
        const { username, password } = body;
        // * ================================================
        // * Check if username or password is empty.
        // * ================================================
        if (!username || !password) {
          set.status = 400;
          return {
            message: 'Username or password cannot be empty.',
          };
        }
        // * ================================================
        // * Check for existing user.
        // * ================================================
        try {
          const userExists = await prisma.user.findUnique({
            where: {
              username,
            },
            select: {
              id: true,
            },
          });
          if (userExists) {
            set.status = 400;
            return {
              message: 'Username already in use.',
            };
          }
        } catch (error) {
          console.error('Failed to find the user:', error);
          set.status = 500;
          return {
            message: 'Server error. Unable process the request.',
          };
        }

        try {
          // * ================================================
          // * Hash the password.
          // * ================================================
          const hash = await Bun.password.hash(password);
          // * ================================================
          // * Save the user to the database.
          // * ================================================
          const user = await prisma.user.create({
            data: {
              username,
              hash,
            },
            select: {
              id: true,
              username: true,
            },
          });
          // * ================================================
          // * Store JWT in a cookie.
          // * ================================================
          setCookie(
            'auth',
            await jwt.sign({ id: user.id, username: user.username }),
            {
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
              secure: Bun.env.NODE_ENV === 'production',
            }
          );
          set.status = 201;
        } catch (error) {
          console.log('Failed to create a new user:', error);
          set.status = 500;
          return {
            message: 'Server error. Unable to create an account.',
          };
        }
      }
    )
    .post('/signin', ({ body }) => {
      const { username, password } = body as {
        username: string;
        password: string;
      };
      console.log(username, password);
    })
    .post('/logout', ({ body }) => {
      const { username, password } = body as {
        username: string;
        password: string;
      };
      console.log(username, password);
    });

  return app;
};
