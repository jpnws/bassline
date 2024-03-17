import { Elysia } from 'elysia';
import PostController from 'src/posts/PostController';
import { getPostRouteSpec } from 'src/posts/routes/routeSpecs';

export const getPost = (postController: PostController) => {
  return new Elysia().get(
    '/posts/:id',
    postController.getPostById,
    getPostRouteSpec,
  );
};
