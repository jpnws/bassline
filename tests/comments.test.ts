import { describe, afterAll, it, expect, beforeAll } from 'bun:test';

import Helper from 'tests/helper';

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

  it('should create a single comment', async () => {
    // * ========================
    // * Arrange
    // * ========================
    // Create a board.
    const boardCreateResponse = await helper.createBoard({
      name: 'test-board-name1',
    });
    const { id: boardId } = boardCreateResponse.body;
    // Create a user.
    const userCreateResponse = await helper.createUser({
      username: 'test-user-username1',
      password: 'password',
    });
    const { id: userId } = userCreateResponse.body;
    const postCreateResponse = await helper.createPost({
      subject: 'test-post-subject1',
      text: 'test-post-text1',
      boardId: boardId,
      userId: userId,
    });
    const { id: postId } = postCreateResponse.body;
    // * ========================
    // * Act
    // * ========================
    const newComment = {
      text: 'test-comment-text1',
      postId: postId,
      userId: userId,
    };
    const commentCreateResponse = await helper.createComment(newComment);
    // * ========================
    // * Assert
    // * ========================
    expect(commentCreateResponse.status).toBe(201);
    const comment = commentCreateResponse.body;
    expect(comment.text).toBe(newComment.text);
    expect(comment.postId).toBe(newComment.postId);
    expect(comment.userId).toBe(newComment.userId);
  });

  it('should update a comment', async () => {
    // * ========================
    // * Arrange
    // * ========================
    // Create a board.
    const boardCreateResponse = await helper.createBoard({
      name: 'test-board-name2',
    });
    const { id: boardId } = boardCreateResponse.body;
    // Create a user.
    const userCreateResponse = await helper.createUser({
      username: 'test-user-username2',
      password: 'password',
    });
    const { id: userId } = userCreateResponse.body;
    const postCreateResponse = await helper.createPost({
      subject: 'test-post-subject2',
      text: 'test-post-text2',
      boardId: boardId,
      userId: userId,
    });
    const { id: postId } = postCreateResponse.body;
    const commentCreateResponse = await helper.createComment({
      text: 'test-comment-text2',
      postId: postId,
      userId: userId,
    });
    const { id: commentId } = commentCreateResponse.body;
    // * ========================
    // * Act
    // * ========================
    const updatedComment = {
      text: 'test-comment-text2-updated',
      postId: postId,
      userId: userId,
    };
    const commentUpdateResponse = await helper.updateComment(
      commentId,
      updatedComment
    );
    // * ========================
    // * Assert
    // * ========================
    expect(commentUpdateResponse.status).toBe(200);
    const comment = commentUpdateResponse.body;
    expect(comment.text).toBe(updatedComment.text);
    expect(comment.postId).toBe(updatedComment.postId);
    expect(comment.userId).toBe(updatedComment.userId);
  });

  it('should delete a comment', async () => {});

  it('should return comments by post id', async () => {});
});
