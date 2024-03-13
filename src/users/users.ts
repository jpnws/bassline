import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';
import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';

import { createUser } from 'src/users/routes/createUser';
import { deleteUser } from 'src/users/routes/deleteUser';
import { getCurrentUser } from 'src/users/routes/getCurrentUser';
import { getUser } from 'src/users/routes/getUser';
import { updateUser } from 'src/users/routes/updateUser';

import UserController from 'src/users/UserController';
import UserRepository from 'src/users/UserRepository';
import UserService from 'src/users/UserService';

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
    .use(createUser(userController))
    .use(getUser(userController))
    .use(updateUser(userController))
    .use(deleteUser(userController))
    .use(getCurrentUser(userController));

  return app;
};