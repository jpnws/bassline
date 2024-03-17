import { IBoardEntity } from 'src/boards/BoardEntity';
import { IBoardPostEntity } from 'src/boards/BoardPostEntity';
import { IBoardRepository } from 'src/boards/BoardRepository';

export interface IBoardService {
  addBoard: (name: string) => Promise<IBoardEntity>;
  getBoardPosts: (id: number) => Promise<IBoardPostEntity>;
}

export default class BoardService implements IBoardService {
  private boardRepository: IBoardRepository;

  constructor(boardRepository: IBoardRepository) {
    this.boardRepository = boardRepository;
  }

  public addBoard = async (name: string) => {
    return await this.boardRepository.add(name);
  };

  public getBoardPosts = async (id: number) => {
    return await this.boardRepository.getBoardPosts(id);
  };
}
