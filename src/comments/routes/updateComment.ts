import { Elysia } from 'elysia';
import CommentController from 'src/comments/CommentController';
import { updateCommentRouteSpec } from 'src/comments/routes/routeSpecs';

export const updateComment = (commentController: CommentController) => {
  return new Elysia().put(
    '/comments/:id',
    commentController.updateComment,
    updateCommentRouteSpec,
  );
};
