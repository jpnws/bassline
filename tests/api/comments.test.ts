import argon2 from 'argon2';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import Helper from 'tests/api/helper';

describe('Comments API', () => {
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

  it('should create a comment', async () => {
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
      username: 'tuser1',
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
    const post = postCreateResponse.body.data.post;
    // * ========================
    // * Act
    // * ========================
    const newComment = {
      text: 'test-comment-text1',
      postId: post.id,
      authorId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Authorization: bearer,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(commentCreateResponse.status).toBe(201);
    expect(commentCreateResponse.body.data).toBeDefined();
    expect(commentCreateResponse.body.data.comment).toBeDefined();
    const comment = commentCreateResponse.body.data.comment;
    expect(comment.id).toBeDefined();
  });

  it('should retrieve a single comment by id', async () => {
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
      username: 'tuser2',
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
    const newComment = {
      text: 'test-comment-text1',
      postId: postData.id,
      authorId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Authorization: bearer,
    });
    const commentData = commentCreateResponse.body.data.comment;
    // * ========================
    // * Act
    // * ========================
    const commentGetResponse = await helper.getComment(commentData.id, {
      Authorization: bearer,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(commentGetResponse.status).toBe(200);
    expect(commentGetResponse.body.data).toBeDefined();
    expect(commentGetResponse.body.data.comment).toBeDefined();
    const comment = commentGetResponse.body.data.comment;
    expect(comment.id).toBeDefined();
    expect(comment.text).toBe(newComment.text);
    expect(comment.createdAt).toBeDefined();
    expect(comment.updatedAt).toBeDefined();
    expect(comment.post.id).toBe(postData.id);
    expect(comment.author.id).toBe(user.id);
    expect(comment.author.username).toBe(newUser.username);
  });

  it('should update a comment', async () => {
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
      username: 'tuser3',
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
    const newComment = {
      text: 'test-comment-text1',
      postId: postData.id,
      authorId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Authorization: bearer,
    });
    const commentData = commentCreateResponse.body.data.comment;
    // * ========================
    // * Act
    // * ========================
    const updateComment = {
      text: 'updated-comment-text2',
      postId: postData.id,
      authorId: user.id,
    };
    const commentUpdateResponse = await helper.updateComment(
      commentData.id,
      updateComment,
      {
        Authorization: bearer,
      },
    );
    // * ========================
    // * Assert
    // * ========================
    expect(commentUpdateResponse.status).toBe(200);
  });

  it('should delete a comment', async () => {
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
      username: 'tuser4',
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
    const newComment = {
      text: 'test-comment-text1',
      postId: postData.id,
      authorId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Authorization: bearer,
    });
    const commentData = commentCreateResponse.body.data.comment;
    // * ========================
    // * Act
    // * ========================
    const commentDeleteResponse = await helper.deleteComment(commentData.id, {
      Authorization: bearer,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(commentDeleteResponse.status).toBe(202);
    const commentGetResponse = await helper.getComment(commentData.id);
    expect(commentGetResponse.status).toBe(404);
  });

  it('should prevent creating comment with text longer than 350 characters', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name6',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'tuser6',
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
    const post = postCreateResponse.body.data.post;
    // * ========================
    // * Act
    // * ========================
    const newComment = {
      text: 'a'.repeat(351),
      postId: post.id,
      authorId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Authorization: bearer,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(commentCreateResponse.status).toBe(400);
    expect(commentCreateResponse.body.error).toBe('Bad Request');
    expect(commentCreateResponse.body.message).toBe(
      'The comment should be at least 1 character and at most 350 characters.',
    );
  });

  it('should prevent creating comment with text shorter than 1 character', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name7',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'tuser7',
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
    const post = postCreateResponse.body.data.post;
    // * ========================
    // * Act
    // * ========================
    const newComment = {
      text: '',
      postId: post.id,
      authorId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Authorization: bearer,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(commentCreateResponse.status).toBe(400);
    expect(commentCreateResponse.body.error).toBe('Bad Request');
    expect(commentCreateResponse.body.message).toBe(
      'The comment should be at least 1 character and at most 350 characters.',
    );
  });

  it('should prevent updating comment with text longer than 350 characters', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name8',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'tuser8',
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
    const post = postCreateResponse.body.data.post;
    const newComment = {
      text: 'test-comment-text1',
      postId: post.id,
      authorId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Authorization: bearer,
    });
    const comment = commentCreateResponse.body.data.comment;
    // * ========================
    // * Act
    // * ========================
    const updateComment = {
      text: 'a'.repeat(351),
      postId: post.id,
      authorId: user.id,
    };
    const commentUpdateResponse = await helper.updateComment(
      comment.id,
      updateComment,
      {
        Authorization: bearer,
      },
    );
    // * ========================
    // * Assert
    // * ========================
    expect(commentUpdateResponse.status).toBe(400);
    expect(commentUpdateResponse.body.error).toBe('Bad Request');
    expect(commentUpdateResponse.body.message).toBe(
      'The comment should be at least 1 character and at most 350 characters.',
    );
  });

  it('should prevent updating comment with text shorter than 1 character', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name9',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'tuser9',
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
    const post = postCreateResponse.body.data.post;
    const newComment = {
      text: 'test-comment-text1',
      postId: post.id,
      authorId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Authorization: bearer,
    });
    const comment = commentCreateResponse.body.data.comment;
    // * ========================
    // * Act
    // * ========================
    const updateComment = {
      text: '',
      postId: post.id,
      authorId: user.id,
    };
    const commentUpdateResponse = await helper.updateComment(
      comment.id,
      updateComment,
      {
        Authorization: bearer,
      },
    );
    // * ========================
    // * Assert
    // * ========================
    expect(commentUpdateResponse.status).toBe(400);
    expect(commentUpdateResponse.body.error).toBe('Bad Request');
    expect(commentUpdateResponse.body.message).toBe(
      'The comment should be at least 1 character and at most 350 characters.',
    );
  });

  it('should allow non-author admin to delete a different author comment', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name20',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'tuser24',
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
    const newComment = {
      text: 'test-comment-text1',
      postId: postData.id,
      authorId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Authorization: bearer,
    });
    const commentData = commentCreateResponse.body.data.comment;
    await helper.prisma?.user.create({
      data: {
        username: 'adminy',
        hash: await argon2.hash('password'),
        role: 'ADMIN',
      },
    });
    // sign in admin
    const adminSignInResponse = await helper.signInUser({
      username: 'adminy',
      password: 'password',
    });
    const adminToken = adminSignInResponse.body.data.token;
    const adminBearer = `Bearer ${adminToken}`;
    // * ========================
    // * Act
    // * ========================
    const commentDeleteResponse = await helper.deleteComment(commentData.id, {
      Authorization: adminBearer,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(commentDeleteResponse.status).toBe(202);
  });

  it('should all non-author admin to update a different author comment', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const board = await helper.prisma?.board.create({
      data: {
        name: 'test-board-name21',
      },
    });
    if (!board) {
      expect(board).not.toBeNull();
      expect(board).not.toBeUndefined();
      return;
    }
    const newUser = {
      username: 'tuser25',
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
    const newComment = {
      text: 'test-comment-text1',
      postId: postData.id,
      authorId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Authorization: bearer,
    });
    const commentData = commentCreateResponse.body.data.comment;
    await helper.prisma?.user.create({
      data: {
        username: 'adminz',
        hash: await argon2.hash('password'),
        role: 'ADMIN',
      },
    });
    // sign in admin
    const adminSignInResponse = await helper.signInUser({
      username: 'adminz',
      password: 'password',
    });
    const adminToken = adminSignInResponse.body.data.token;
    const adminBearer = `Bearer ${adminToken}`;
    // * ========================
    // * Act
    // * ========================
    const updateComment = {
      text: 'updated-comment-text2',
      postId: postData.id,
      authorId: user.id,
    };
    const commentUpdateResponse = await helper.updateComment(
      commentData.id,
      updateComment,
      {
        Authorization: adminBearer,
      },
    );
    // * ========================
    // * Assert
    // * ========================
    expect(commentUpdateResponse.status).toBe(200);
  });
});
