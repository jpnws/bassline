import { describe, afterAll, it, expect, beforeAll } from 'bun:test';

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
      username: 'test-user-username1',
      password: 'password',
    };
    const userSignUpResponse = await helper.signUpUser(newUser);
    const user = userSignUpResponse.body.data.user;
    const cookies = userSignUpResponse.get('Set-Cookie');
    const newPost = {
      subject: 'test-post-subject1',
      text: 'test-post-text1',
      boardId: board.id,
      userId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    const post = postCreateResponse.body.data.post;
    // * ========================
    // * Act
    // * ========================
    const newComment = {
      text: 'test-comment-text1',
      postId: post.id,
      userId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Cookie: cookies,
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
    const newComment = {
      text: 'test-comment-text1',
      postId: postData.id,
      userId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Cookie: cookies,
    });
    const commentData = commentCreateResponse.body.data.comment;
    // * ========================
    // * Act
    // * ========================
    const commentGetResponse = await helper.getComment(commentData.id, {
      Cookie: cookies,
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
    expect(comment.post.id).toBe(postData.id);
    expect(comment.user.id).toBe(user.id);
    expect(comment.user.username).toBe(newUser.username);
    expect(comment.user.isAuthor).toBeTrue();
    expect(comment.user.isAdmin).toBeFalse();
  });

  it('should update a comment', async () => {
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
      subject: 'test-post-subject2',
      text: 'test-post-text2',
      boardId: board.id,
      userId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    const postData = postCreateResponse.body.data.post;
    const newComment = {
      text: 'test-comment-text1',
      postId: postData.id,
      userId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Cookie: cookies,
    });
    const commentData = commentCreateResponse.body.data.comment;
    // * ========================
    // * Act
    // * ========================
    const updateComment = {
      text: 'updated-comment-text2',
      postId: postData.id,
      userId: user.id,
    };
    const commentUpdateResponse = await helper.updateComment(
      commentData.id,
      updateComment,
      {
        Cookie: cookies,
      }
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
      subject: 'test-post-subject2',
      text: 'test-post-text2',
      boardId: board.id,
      userId: user.id,
    };
    const postCreateResponse = await helper.createPost(newPost, {
      Cookie: cookies,
    });
    const postData = postCreateResponse.body.data.post;
    const newComment = {
      text: 'test-comment-text1',
      postId: postData.id,
      userId: user.id,
    };
    const commentCreateResponse = await helper.createComment(newComment, {
      Cookie: cookies,
    });
    const commentData = commentCreateResponse.body.data.comment;
    // * ========================
    // * Act
    // * ========================
    const commentDeleteResponse = await helper.deleteComment(commentData.id, {
      Cookie: cookies,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(commentDeleteResponse.status).toBe(202);
    const commentGetResponse = await helper.getComment(commentData.id);
    expect(commentGetResponse.status).toBe(404);
  });
});
