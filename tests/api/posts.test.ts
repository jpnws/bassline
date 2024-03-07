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
    const userSignUpResponse = await helper.signUpUser(newUser);
    const user = userSignUpResponse.body.data.user;
    const cookies = userSignUpResponse.get('Set-Cookie');
    // * ========================
    // * Act
    // * ========================
    const newPost = {
      subject: 'test-post-subject1',
      text: 'test-post-text1',
      boardId: board.id,
      userId: user.id,
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
    const userSignUpResponse = await helper.signUpUser(newUser);
    const user = userSignUpResponse.body.data.user;
    const cookies = userSignUpResponse.get('Set-Cookie');
    const newPost = {
      subject: 'test-post-subject2',
      text: 'test-post-text2',
      boardId: board.id,
      userId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    const postData = postCreateResponse.body.data.post;
    // * ========================
    // * Act
    // * ========================
    const postGetResponse = await helper.getPost(postData.id, {
      Cookie: cookies,
    });
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
    expect(post.user.id).toBe(user.id);
    expect(post.user.username).toBe(newUser.username);
    expect(post.user.isAuthor).toBeTrue();
    expect(post.user.isAdmin).toBeFalse();
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
    const userSignUpResponse = await helper.signUpUser(newUser);
    const user = userSignUpResponse.body.data.user;
    const cookies = userSignUpResponse.get('Set-Cookie');
    const newPost = {
      subject: 'test-post-subject3',
      text: 'test-post-text3',
      boardId: board.id,
      userId: user.id,
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
      userId: user.id,
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
    const userSignUpResponse = await helper.signUpUser(newUser);
    const user = userSignUpResponse.body.data.user;
    const cookies = userSignUpResponse.get('Set-Cookie');
    const newPost = {
      subject: 'test-post-subject4',
      text: 'test-post-text4',
      boardId: board.id,
      userId: user.id,
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

  it('should return true if a user is the author of a post', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newBoard = {
      name: 'test-board-name8',
    };
    const boardCreateResponse = await helper.createBoard(newBoard);
    const { id: boardId } = boardCreateResponse.body;
    const newUser = {
      username: 'ironman',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    expect(signUpUserResponse.status).toBe(201);
    const { data } = signUpUserResponse.body;
    const { user } = data;
    const cookies = signUpUserResponse.get('Set-Cookie');
    const newPost = {
      subject: 'test-post-subject8',
      text: 'test-post-text8',
      boardId: boardId,
      userId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    expect(postCreateResponse.status).toBe(201);
    const { data: newPostResponseData } = postCreateResponse.body;
    const { post: newPostResponse } = newPostResponseData;
    const { id: postId } = newPostResponse;
    // * ========================
    // * Act
    // * ========================
    const postGetResponse = await helper.getPost(postId, { Cookie: cookies });
    // * ========================
    // * Assert
    // * ========================
    expect(postGetResponse.status).toBe(200);
    const { data: postGetData } = postGetResponse.body;
    const { post: postData } = postGetData;
    expect(postData.subject).toBe(newPost.subject);
    expect(postData.text).toBe(newPost.text);
    expect(postData.board.name).toBe(newBoard.name);
    expect(postData.user.username).toBe(newUser.username);
    expect(postData.user.isAuthor).toBe(true);
    expect(postData.user.isAdmin).toBe(false);
  });

  it('should prevent creating post if not authenticated', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newBoard = {
      name: 'test-board-name10',
    };
    const boardCreateResponse = await helper.createBoard(newBoard);
    const { id: boardId } = boardCreateResponse.body;
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
      userId: user.id,
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
    const { id: boardId } = boardCreateResponse.body;
    const newUser = {
      username: 'spiderman',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    expect(signUpUserResponse.status).toBe(201);
    const { data } = signUpUserResponse.body;
    const { user } = data;
    let cookies = signUpUserResponse.get('Set-Cookie');
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
      userId: user.id,
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
    const userSignUpResponse = await helper.signUpUser(newUser);
    const user = userSignUpResponse.body.data.user;
    const cookies = userSignUpResponse.get('Set-Cookie');
    const newPost = {
      subject: 'test-post-subject5',
      text: 'test-post-text5',
      boardId: board.id,
      userId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    const post = postCreateResponse.body.data.post;
    const newComment1 = {
      text: 'test-comment-text5',
      postId: post.id,
      userId: user.id,
    };
    const newComment2 = {
      text: 'test-comment-text6',
      postId: post.id,
      userId: user.id,
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
    const getPostCommentsResponse = await helper.getCommentsByPostId(post.id);
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
      expect(comment.user.id).toBeDefined();
      expect(comment.user.username).toBeDefined();
      expect(comment.createdAt).toBeDefined();
      expect(comment.updatedAt).toBeDefined();
    }
  });
});
