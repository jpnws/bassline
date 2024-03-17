import { Elysia } from 'elysia';
import AuthController from 'src/auth/AuthController';
import { demoUserSignInRouteSpec } from 'src/auth/routes/routeSpecs';

export const demoUserSignIn = (authController: AuthController) => {
  return new Elysia().post(
    '/signin/demo-user',
    authController.demoUserSignIn,
    demoUserSignInRouteSpec,
  );
};
