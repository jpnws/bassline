import { Elysia } from 'elysia';
import AuthController from 'src/auth/AuthController';
import { demoAdminSignInRouteSpec } from 'src/auth/routes/routeSpecs';

export const demoAdminSignIn = (authController: AuthController) => {
  return new Elysia().post(
    '/signin/demo-admin',
    authController.demoAdminSignIn,
    demoAdminSignInRouteSpec
  );
};
