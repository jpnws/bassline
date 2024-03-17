import { Elysia } from 'elysia';
import AuthController from 'src/auth/AuthController';
import { signupRouteSpec } from 'src/auth/routes/routeSpecs';

export const signup = (authController: AuthController) => {
  return new Elysia().post('/signup', authController.signup, signupRouteSpec);
};
