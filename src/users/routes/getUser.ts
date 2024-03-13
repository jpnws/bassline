import { Elysia } from 'elysia';
import UserController from 'src/users/UserController';
import { getUserRouteSpec } from 'src/users/routes/routeSpecs';

export const getUser = (userController: UserController) => {
  return new Elysia().get(
    '/users/:id',
    userController.getUserById,
    getUserRouteSpec
  );
};
