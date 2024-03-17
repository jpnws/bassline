import { Elysia } from 'elysia';
import UserController from 'src/users/UserController';
import { deleteUserRouteSpec } from 'src/users/routes/routeSpecs';

export const deleteUser = (userController: UserController) => {
  return new Elysia().delete(
    '/users/:id',
    userController.deleteUserById,
    deleteUserRouteSpec,
  );
};
