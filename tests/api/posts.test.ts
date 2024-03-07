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

  it('should return posts by board id', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name5',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'test-user-username5',
      password: 'password',
    };
    const userSignUpResponse = await helper.signUpUser(newUser);
    const user = userSignUpResponse.body.data.user;
    const cookies = userSignUpResponse.get('Set-Cookie');
    let newPosts = [
      {
        subject: 'test-post-subject5',
        text: 'test-post-text5',
        boardId: board.id,
        userId: user.id,
      },
      {
        subject: 'test-post-subject6',
        text: 'test-post-text6',
        boardId: board.id,
        userId: user.id,
      },
    ];
    for (const newPost of newPosts) {
      await helper.createPost(newPost, { Cookie: cookies });
    }
    // * ========================
    // * Act
    // * ========================
    const getPostsResponse = await helper.getPostsByBoardId(board.id);
    // * ========================
    // * Assert
    // * ========================
    expect(getPostsResponse.status).toBe(200);
    const posts = getPostsResponse.body;
    for (let i = 0; i < newPosts.length; i++) {
      expect(posts[i].subject).toBe(newPosts[i]?.subject);
      expect(posts[i].text).toBe(newPosts[i]?.text);
      expect(posts[i].boardId).toBe(newPosts[i]?.boardId);
      expect(posts[i].userId).toBe(newPosts[i]?.userId);
    }
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
});
