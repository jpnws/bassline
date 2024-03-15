import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';
import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';

import { createUser } from 'src/users/routes/createUser';
import { deleteUser } from 'src/users/routes/deleteUser';
import { getCurrentUser } from 'src/users/routes/getCurrentUser';
import { getUser } from 'src/users/routes/getUser';
import { updateUser } from 'src/users/routes/updateUser';

import UserRepository from 'src/users/UserRepository';
import UserService from 'src/users/UserService';
import UserController from 'src/users/UserController';

/**
 * Users routes.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const users = (prisma: PrismaClient) => {
  const app = new Elysia();

  const userRepository = new UserRepository(prisma);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  app
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.APP_JWT_SECRET,
      })
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
              error: 'User Not Authenticated',
              message: 'Authentication token was missing.',
            };
          }
          if (!currentUser) {
            set.status = 401;
            return {
              error: 'User Unauthorized',
              message: 'Authentication token was missing or incorrect',
            };
          }
          if (currentUser.role !== 'ADMIN') {
            set.status = 401;
            return {
              error: 'User Unauthorized',
              message: 'Only admins are allowed to access this resource.',
            };
          }
        },
      },
      (app) =>
        app
          .use(createUser(userController))
          .use(getUser(userController))
          .use(updateUser(userController))
          .use(deleteUser(userController))
    )
    .use(getCurrentUser(userController));

  return app;
};
