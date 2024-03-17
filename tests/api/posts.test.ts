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
    const bearer = `Bearer ${token}`;
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
      Authorization: bearer,
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
    const bearer = `Bearer ${token}`;
    const newPost = {
      subject: 'test-post-subject2',
      text: 'test-post-text2',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Authorization: bearer,
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
    const bearer = `Bearer ${token}`;
    const newPost = {
      subject: 'test-post-subject3',
      text: 'test-post-text3',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Authorization: bearer,
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
        Authorization: bearer,
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
    const bearer = `Bearer ${token}`;
    const newPost = {
      subject: 'test-post-subject4',
      text: 'test-post-text4',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Authorization: bearer,
    });
    const postData = postCreateResponse.body.data.post;
    // * ========================
    // * Act
    // * ========================
    const postDeleteResponse = await helper.deletePost(postData.id, {
      Authorization: bearer,
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
    const bearer = `Bearer ${token}abc`;
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
      Authorization: bearer,
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
    const bearer = `Bearer ${token}`;
    const newPost = {
      subject: 'test-post-subject5',
      text: 'test-post-text5',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Authorization: bearer,
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
      Authorization: bearer,
    });
    const commentCreateResponse2 = await helper.createComment(newComment2, {
      Authorization: bearer,
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

  it('should prevent creating a post if logged in user (currentUser.id) does not match authorId', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name12',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser0 = {
      username: 'test-user-username14',
      password: 'password',
    };
    const signUpUserResponse0 = await helper.signUpUser(newUser0);
    const user0 = signUpUserResponse0.body.data.user;
    const newUser = {
      username: 'test-user-username15',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const bearer = `Bearer ${token}`;
    // * ========================
    // * Act
    // * ========================
    const newPost = {
      subject: 'test-post-subject1',
      text: 'test-post-text1',
      boardId: board.id,
      authorId: user0.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Authorization: bearer,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(postCreateResponse.status).toBe(401);
    expect(postCreateResponse.body.data).not.toBeDefined();
  });

  it('should prevent updating a post if logged in user is not the author', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name13',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'test-user-username16',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    const user = signUpUserResponse.body.data.user;
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const bearer = `Bearer ${token}`;
    const newPost = {
      subject: 'test-post-subject3',
      text: 'test-post-text3',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Authorization: bearer,
    });
    const newUser2 = {
      username: 'test-user-username17',
      password: 'password',
    };
    const postData = postCreateResponse.body.data.post;
    const signUpUserResponse2 = await helper.signUpUser(newUser2);
    expect(signUpUserResponse2.body.data.token).toBeDefined();
    expect(signUpUserResponse2.body.data.token).toBeString();
    const token2 = signUpUserResponse2.body.data.token;
    const bearer2 = `Bearer ${token2}`;
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
        Authorization: bearer2,
      }
    );
    // * ========================
    // * Assert
    // * ========================
    expect(postUpdateResponse.status).toBe(401);
  });

  it('should prevent deleting a post when non-author attempts to delete it', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name14',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'test-user-username18',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    const user = signUpUserResponse.body.data.user;
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const bearer = `Bearer ${token}`;
    const newPost = {
      subject: 'test-post-subject1',
      text: 'test-post-text1',
      boardId: board.id,
      authorId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Authorization: bearer,
    });
    const postData = postCreateResponse.body.data.post;
    const newUser2 = {
      username: 'test-user-username29',
      password: 'password',
    };
    const signUpUserResponse2 = await helper.signUpUser(newUser2);
    expect(signUpUserResponse2.body.data.token).toBeDefined();
    expect(signUpUserResponse2.body.data.token).toBeString();
    const token2 = signUpUserResponse2.body.data.token;
    const bearer2 = `Bearer ${token2}`;
    // * ========================
    // * Act
    // * ========================
    const postDeleteResponse = await helper.deletePost(postData.id, {
      Authorization: bearer2,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(postDeleteResponse.status).toBe(401);
  });
});
