import { IBoardService } from 'src/boards/BoardService';

interface RouteContext {
  params: { id: number };
  body: {
    name: string;
  };
  set: { status: number };
  currentUser: {
    id: number;
    username: string;
    role: string;
  };
}

export default class BoardController {
  private boardService: IBoardService;

  constructor(boardService: IBoardService) {
    this.boardService = boardService;
  }

  public createBoard = async ({ body, set }: RouteContext) => {
    const { name } = body;
    try {
      const board = await this.boardService.addBoard(name);
      set.status = 201;
      return {
        data: {
          board: {
            id: board.id,
          },
        },
      };
    } catch (error) {
      set.status = 500;
      return {
        error: 'Internal server error',
        message: 'Failed to create the post.',
      };
    }
  };

  public getBoardPosts = async ({ params: { id }, set }: RouteContext) => {
    try {
      const board = await this.boardService.getBoardPosts(id);
      set.status = 200;
      return {
        data: {
          board,
        },
      };
    } catch (error) {
      set.status = 500;
      return {
        error: 'Internal server error',
        message: 'Failed to create the post.',
      };
    }
  };
}
