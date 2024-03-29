import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import Helper from 'tests/api/helper';

describe('Boards API', () => {
  let helper: Helper;

  beforeAll(async () => {
    helper = new Helper();
    await helper.spawnApp();
  });

  afterAll(async () => {
    await helper.app?.stop();
    await helper.prisma?.$disconnect();
    await helper.dropDb();
  });

  it('should create a board', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newBoard = {
      name: 'test-board-name1',
    };
    // * ========================
    // * Act
    // * ========================
    const boardCreateResponse = await helper.createBoard(newBoard);
    // * ========================
    // * Assert
    // * ========================
    expect(boardCreateResponse.status).toBe(201);
  });

  it('should retrieve all posts associated with a board', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newBoard = {
      name: 'test-board-name4',
    };
    const board = await helper.prisma?.board.create({
      data: {
        name: newBoard.name,
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'tuser2',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    const user = signUpUserResponse.body.data.user;
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const bearer = `Bearer ${token}`;
    const newPost1 = {
      subject: 'test-post-subject2',
      text: 'test-post-text2',
      boardId: board.id,
      authorId: user.id,
    };
    const newPost2 = {
      subject: 'test-post-subject3',
      text: 'test-post-text3',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse1 = await helper.createPost(newPost1, {
      Authorization: bearer,
    });
    const postCreateResponse2 = await helper.createPost(newPost2, {
      Authorization: bearer,
    });
    // * ========================
    // * Act
    // * ========================
    const getBoardPostsResponse = await helper.getBoardPosts(board.id);
    // * ========================
    // * Assert
    // * ========================
    expect(postCreateResponse1.status).toBe(201);
    expect(postCreateResponse2.status).toBe(201);
    expect(getBoardPostsResponse.status).toBe(200);
    const boardData = getBoardPostsResponse.body.data.board;
    expect(boardData.id).toBeDefined();
    expect(boardData.name).toBe(newBoard.name);
    const posts = getBoardPostsResponse.body.data.board.posts;
    expect(posts.length).toBe(2);
    for (const post of posts) {
      expect(post.id).toBeDefined();
      expect(post.subject).toBeDefined();
      expect(post.createdAt).toBeDefined();
      expect(post.author.id).toBeDefined();
      expect(post.author.username).toBeDefined();
    }
  });
});
