import { Elysia } from 'elysia';
import CommentController from 'src/comments/CommentController';
import { getCommentRouteSpec } from 'src/comments/routes/routeSpecs';

export const getComment = (commentController: CommentController) => {
  return new Elysia().get(
    '/comments/:id',
    commentController.getCommentbyId,
    getCommentRouteSpec
  );
};
