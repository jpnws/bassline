import { Elysia } from 'elysia';
import UserController from 'src/users/UserController';
import { createUserRouteSpec } from 'src/users/routes/routeSpecs';

export const createUser = (userController: UserController) => {
  return new Elysia().post(
    '/users',
    userController.createUser,
    createUserRouteSpec,
  );
};
