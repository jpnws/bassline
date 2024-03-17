import { Elysia } from 'elysia';
import PostController from 'src/posts/PostController';
import { getPostCommentsRouteSpec } from 'src/posts/routes/routeSpecs';

export const getPostComments = (postController: PostController) => {
  return new Elysia().get(
    '/posts/:id/comments',
    postController.getPostComments,
    getPostCommentsRouteSpec,
  );
};
