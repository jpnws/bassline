import { Elysia } from 'elysia';
import UserController from 'src/users/UserController';
import { getCurrentUserRouteSpec } from 'src/users/routes/routeSpecs';

export const getCurrentUser = (userController: UserController) => {
  return new Elysia().get(
    '/users/current',
    userController.getCurrentUser,
    getCurrentUserRouteSpec
  );
};
