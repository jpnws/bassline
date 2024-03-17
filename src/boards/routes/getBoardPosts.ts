import { Elysia } from 'elysia';
import BoardController from 'src/boards/BoardController';
import { getBoardPostsRouteSpec } from 'src/boards/routes/routeSpecs';

export const getBoardPosts = (boardController: BoardController) => {
  return new Elysia().get(
    '/boards/:id/posts',
    boardController.getBoardPosts,
    getBoardPostsRouteSpec,
  );
};
