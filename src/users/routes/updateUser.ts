import { Elysia } from 'elysia';
import UserController from 'src/users/UserController';
import { updateUserRouteSpec } from 'src/users/routes/routeSpecs';

export const updateUser = (userController: UserController) => {
  return new Elysia().put(
    '/users/:id',
    userController.updateUser,
    updateUserRouteSpec
  );
};
