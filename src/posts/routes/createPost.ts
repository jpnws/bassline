import { Elysia } from 'elysia';
import PostController from 'src/posts/PostController';
import { createPostRouteSpec } from 'src/posts/routes/routeSpecs';

export const createPost = (postController: PostController) => {
  return new Elysia().post(
    '/posts',
    postController.createPost,
    createPostRouteSpec
  );
};
