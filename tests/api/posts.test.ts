import { describe, afterAll, it, expect, beforeAll } from 'bun:test';

import Helper from 'tests/api/helper';

describe('Posts API', () => {
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

  it('should create a post', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name1',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'test-user-username1',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    const user = signUpUserResponse.body.data.user;
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const cookies = [`auth=${token}`];
    // * ========================
    // * Act
    // * ========================
    const newPost = {
      subject: 'test-post-subject1',
      text: 'test-post-text1',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(postCreateResponse.status).toBe(201);
    expect(postCreateResponse.body.data).toBeDefined();
    expect(postCreateResponse.body.data.post).toBeDefined();
    const post = postCreateResponse.body.data.post;
    expect(post.id).toBeDefined();
  });

  it('should retrieve a single post by id', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name2',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'test-user-username2',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    const user = signUpUserResponse.body.data.user;
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const cookies = [`auth=${token}`];
    const newPost = {
      subject: 'test-post-subject2',
      text: 'test-post-text2',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    const postData = postCreateResponse.body.data.post;
    // * ========================
    // * Act
    // * ========================
    const postGetResponse = await helper.getPost(postData.id);
    // * ========================
    // * Assert
    // * ========================
    expect(postGetResponse.status).toBe(200);
    expect(postGetResponse.body.data).toBeDefined();
    expect(postGetResponse.body.data.post).toBeDefined();
    const post = postGetResponse.body.data.post;
    expect(post.id).toBeDefined();
    expect(post.subject).toBe(newPost.subject);
    expect(post.text).toBe(newPost.text);
    expect(post.board.id).toBe(board.id);
    expect(post.board.name).toBe(board.name);
    expect(post.author.id).toBe(user.id);
    expect(post.author.username).toBe(newUser.username);
  });

  it('should update a post', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name3',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'test-user-username3',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    const user = signUpUserResponse.body.data.user;
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const cookies = [`auth=${token}`];
    const newPost = {
      subject: 'test-post-subject3',
      text: 'test-post-text3',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    const postData = postCreateResponse.body.data.post;
    // * ========================
    // * Act
    // * ========================
    const updatedPost = {
      subject: 'updated-post-subject3',
      text: 'updated-post-text3',
      boardId: board.id,
      authorId: user.id,
    };
    const postUpdateResponse = await helper.updatePost(
      postData.id,
      updatedPost,
      {
        Cookie: cookies,
      }
    );
    // * ========================
    // * Assert
    // * ========================
    expect(postUpdateResponse.status).toBe(200);
  });

  it('should delete a post', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name4',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'test-user-username4',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    const user = signUpUserResponse.body.data.user;
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const cookies = [`auth=${token}`];
    const newPost = {
      subject: 'test-post-subject4',
      text: 'test-post-text4',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    const postData = postCreateResponse.body.data.post;
    // * ========================
    // * Act
    // * ========================
    const postDeleteResponse = await helper.deletePost(postData.id, {
      Cookie: cookies,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(postDeleteResponse.status).toBe(202);
    const postGetResponse = await helper.getPost(postData.id);
    expect(postGetResponse.status).toBe(404);
  });

  it('should prevent creating post if not authenticated', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newBoard = {
      name: 'test-board-name10',
    };
    const boardCreateResponse = await helper.createBoard(newBoard);
    const { id: boardId } = boardCreateResponse.body.data.board;
    const newUser = {
      username: 'superman',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    expect(signUpUserResponse.status).toBe(201);
    const { data } = signUpUserResponse.body;
    const { user } = data;
    // * ========================
    // * Act
    // * ========================
    const newPost = {
      subject: 'test-post-subject7',
      text: 'test-post-text7',
      boardId: boardId,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost);
    // * ========================
    // * Assert
    // * ========================
    expect(postCreateResponse.status).toBe(400);
  });

  it('should prevent creating post if jwt in cookie is invalid', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newBoard = {
      name: 'test-board-name9',
    };
    const boardCreateResponse = await helper.createBoard(newBoard);
    const { id: boardId } = boardCreateResponse.body.data.board;
    const newUser = {
      username: 'spiderman',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    expect(signUpUserResponse.status).toBe(201);
    const { data } = signUpUserResponse.body;
    const { user } = data;
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const cookies = [`auth=${token}`];
    for (let i = 0; i < cookies.length; i++) {
      if (cookies[i].includes('auth=')) {
        cookies[i] = 'auth=abc; Max-Age=604800; Path=/; HttpOnly';
      }
    }
    // * ========================
    // * Act
    // * ========================
    const newPost = {
      subject: 'test-post-subject8',
      text: 'test-post-text8',
      boardId: boardId,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(postCreateResponse.status).toBe(401);
  });

  it('should retrieve all comments associated with a post', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name11',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'test-user-username12',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    const user = signUpUserResponse.body.data.user;
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const cookies = [`auth=${token}`];
    const newPost = {
      subject: 'test-post-subject5',
      text: 'test-post-text5',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    const post = postCreateResponse.body.data.post;
    const newComment1 = {
      text: 'test-comment-text5',
      postId: post.id,
      authorId: user.id,
    };
    const newComment2 = {
      text: 'test-comment-text6',
      postId: post.id,
      authorId: user.id,
    };
    const commentCreateResponse1 = await helper.createComment(newComment1, {
      Cookie: cookies,
    });
    const commentCreateResponse2 = await helper.createComment(newComment2, {
      Cookie: cookies,
    });
    // * ========================
    // * Act
    // * ========================
    const getPostCommentsResponse = await helper.getPostComments(post.id);
    // * ========================
    // * Assert
    // * ========================
    expect(commentCreateResponse1.status).toBe(201);
    expect(commentCreateResponse2.status).toBe(201);
    expect(getPostCommentsResponse.status).toBe(200);
    const postData = getPostCommentsResponse.body.data.post;
    expect(postData).toBeDefined();
    expect(postData.id).toBeDefined();
    expect(postData.id).toBe(post.id);
    const comments = getPostCommentsResponse.body.data.post.comments;
    expect(comments).toBeDefined();
    expect(comments).toBeArray();
    expect(comments.length).toBe(2);
    for (const comment of comments) {
      expect(comment.id).toBeDefined();
      expect(comment.text).toBeDefined();
      expect(comment.author.id).toBeDefined();
      expect(comment.author.username).toBeDefined();
      expect(comment.createdAt).toBeDefined();
      expect(comment.updatedAt).toBeDefined();
    }
  });
});
