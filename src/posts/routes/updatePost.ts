import { Elysia } from 'elysia';
import PostController from 'src/posts/PostController';
import { updatePostRouteSpec } from 'src/posts/routes/routeSpecs';

export const updatePost = (postController: PostController) => {
  return new Elysia().put(
    '/posts/:id',
    postController.updatePost,
    updatePostRouteSpec
  );
};
