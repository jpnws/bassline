import { Elysia } from 'elysia';
import CommentController from 'src/comments/CommentController';
import { deleteCommentRouteSpec } from 'src/comments/routes/routeSpecs';

export const deleteComment = (commentController: CommentController) => {
  return new Elysia().delete(
    '/comments/:id',
    commentController.deleteCommentById,
    deleteCommentRouteSpec
  );
};
