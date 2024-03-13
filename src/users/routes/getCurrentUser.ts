import { Elysia } from 'elysia';
import UserController from 'src/users/UserController';
import { getCurrentUserSpec } from 'src/users/openApiSpec';

export const getCurrentUser = (userController: UserController) => {
  const app = new Elysia();
  app.get('/users/current', userController.getCurrentUser, getCurrentUserSpec);
  return app;
};
