import { Elysia } from 'elysia';
import BoardController from 'src/boards/BoardController';
import { createBoardRouteSpec } from 'src/boards/routes/routeSpecs';

export const createBoard = (boardController: BoardController) => {
  return new Elysia().post(
    '/boards',
    boardController.createBoard,
    createBoardRouteSpec,
  );
};
