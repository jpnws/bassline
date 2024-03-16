import { Elysia } from 'elysia';
import AuthController from 'src/auth/AuthController';
import { signinRouteSpec } from 'src/auth/routes/routeSpecs';

export const signin = (authController: AuthController) => {
  return new Elysia().post('/signin', authController.signin, signinRouteSpec);
};
