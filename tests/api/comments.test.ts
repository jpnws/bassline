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
    const boardCreateResponse = await helper.createBoard({
      name: 'test-board-name1',
    });
    const { id: boardId } = boardCreateResponse.body;
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
    const boardCreateResponse = await helper.createBoard({
      name: 'test-board-name2',
    });
    const { id: boardId } = boardCreateResponse.body;
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

  it('should delete a comment', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const boardCreateResponse = await helper.createBoard({
      name: 'test-board-name3',
    });
    const { id: boardId } = boardCreateResponse.body;
    const userCreateResponse = await helper.createUser({
      username: 'test-user-username3',
      password: 'password',
    });
    const { id: userId } = userCreateResponse.body;
    const postCreateResponse = await helper.createPost({
      subject: 'test-post-subject3',
      text: 'test-post-text3',
      boardId: boardId,
      userId: userId,
    });
    const { id: postId } = postCreateResponse.body;
    const commentCreateResponse = await helper.createComment({
      text: 'test-comment-text3',
      postId: postId,
      userId: userId,
    });
    const { id: commentId } = commentCreateResponse.body;
    // * ========================
    // * Act
    // * ========================
    const commentDeleteResponse = await helper.deleteComment(commentId);
    // * ========================
    // * Assert
    // * ========================
    expect(commentDeleteResponse.status).toBe(202);
    const commentGetResponse = await helper.getComment(commentId);
    expect(commentGetResponse.status).toBe(404);
  });

  it('should return comments by post id', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const boardCreateResponse = await helper.createBoard({
      name: 'test-board-name4',
    });
    const { id: boardId } = boardCreateResponse.body;
    const userCreateResponse = await helper.createUser({
      username: 'test-user-username4',
      password: 'password',
    });
    const { id: userId } = userCreateResponse.body;
    const postCreateResponse = await helper.createPost({
      subject: 'test-post-subject4',
      text: 'test-post-text3',
      boardId: boardId,
      userId: userId,
    });
    const { id: postId } = postCreateResponse.body;
    let newComments = [
      {
        text: 'test-comment-text4',
        postId: postId,
        userId: userId,
      },
      {
        text: 'test-comment-text5',
        postId: postId,
        userId: userId,
      },
      {
        text: 'test-comment-text6',
        postId: postId,
        userId: userId,
      },
    ];
    for (const newComment of newComments) {
      await helper.createComment(newComment);
    }
    // * ========================
    // * Act
    // * ========================
    const getCommentsResponse = await helper.getCommentsByPostId(postId);
    // * ========================
    // * Assert
    // * ========================
    expect(getCommentsResponse.status).toBe(200);
    const comments = getCommentsResponse.body;
    for (let i = 0; i < newComments.length; i++) {
      expect(comments[i].text).toBe(newComments[i]?.text);
      expect(comments[i].postId).toBe(newComments[i]?.postId);
      expect(comments[i].userId).toBe(newComments[i]?.userId);
    }
  });
});
