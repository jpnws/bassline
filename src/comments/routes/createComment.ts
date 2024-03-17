import { Elysia } from 'elysia';
import CommentController from 'src/comments/CommentController';
import { createCommentRouteSpec } from 'src/comments/routes/routeSpecs';

export const createComment = (commentController: CommentController) => {
  return new Elysia().post(
    '/comments',
    commentController.createComment,
    createCommentRouteSpec,
  );
};
