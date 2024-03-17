import { Elysia } from 'elysia';
import AuthController from 'src/auth/AuthController';
import { signoutRouteSpec } from 'src/auth/routes/routeSpecs';

export const signout = (authController: AuthController) => {
  return new Elysia().post(
    '/signout',
    authController.signout,
    signoutRouteSpec,
  );
};
