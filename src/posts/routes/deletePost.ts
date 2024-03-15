import { Elysia } from 'elysia';
import PostController from 'src/posts/PostController';
import { deletePostRouteSpec } from 'src/posts/routes/routeSpecs';

export const deletePost = (postController: PostController) => {
  return new Elysia().delete(
    '/posts/:id',
    postController.deletePostById,
    deletePostRouteSpec
  );
};
