import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';
import bearer from '@elysiajs/bearer';

import { signup } from 'src/auth/routes/signup';
import { signin } from 'src/auth/routes/signin';
import { signout } from 'src/auth/routes/signout';

import AuthRepository from 'src/auth/AuthRepository';
import AuthService from 'src/auth/AuthService';
import AuthController from 'src/auth/AuthController';
import { demoUserSignIn } from './routes/demoUserSignIn';
import { demoAdminSignIn } from './routes/demoAdminSignIn';

/**
 * Auth route.
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const auth = (prisma: PrismaClient) => {
  const app = new Elysia({ prefix: '/auth' });

  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository);
  const authController = new AuthController(authService);

  app
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.APP_JWT_SECRET,
      }),
    )
    .use(bearer())
    .derive(async ({ jwt, bearer }) => {
      const currentUser = (await jwt.verify(bearer)) as UserBody;
      return { currentUser };
    })
    .guard(
      {
        beforeHandle({ currentUser, bearer, set }) {
          if (!bearer) {
            set.status = 400;
            return {
              error: 'User not authenticated',
              message: 'Authentication token was missing.',
            };
          }
          if (!currentUser) {
            set.status = 401;
            return {
              error: 'User not authorized',
              message: 'Authentication token was invalid.',
            };
          }
        },
      },
      (app) => app.use(signout(authController)),
    )
    .guard(
      {
        beforeHandle({ bearer, set }) {
          if (bearer) {
            set.status = 409;
            return {
              error: 'User already authenticated',
              message: 'You must log out before creating a new account.',
            };
          }
        },
      },
      (app) =>
        app
          .use(signup(authController))
          .use(demoUserSignIn(authController))
          .use(demoAdminSignIn(authController)),
    )
    .use(signin(authController));

  return app;
};
