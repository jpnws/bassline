import { describe, afterAll, it, expect, beforeAll } from 'bun:test';

import Helper from 'tests/helper';

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

  it('should create a single post', async () => {
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
    // * ========================
    // * Act
    // * ========================
    const postCreateResponse = await helper.createPost({
      subject: 'test-post-subject1',
      text: 'test-post-text1',
      boardId: boardId,
      userId: userId,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(postCreateResponse.status).toBe(201);
    const post = postCreateResponse.body;
    expect(post.subject).toBe('test-post-subject1');
    expect(post.text).toBe('test-post-text1');
    expect(post.boardId).toBe(boardId);
    expect(post.userId).toBe(userId);
  });

  it('should return a single post', async () => {
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
    // Create a post.
    const newPost = {
      subject: 'test-post-subject2',
      text: 'test-post-text2',
      boardId: boardId,
      userId: userId,
    };
    const postCreateResponse = await helper.createPost(newPost);
    const { id: postId } = postCreateResponse.body;
    // * ========================
    // * Act
    // * ========================
    const postGetResponse = await helper.getPost(postId);
    // * ========================
    // * Assert
    // * ========================
    expect(postGetResponse.status).toBe(200);
    const post = postGetResponse.body;
    expect(post.subject).toBe(newPost.subject);
    expect(post.text).toBe(newPost.text);
    expect(post.boardId).toBe(newPost.boardId);
    expect(post.userId).toBe(newPost.userId);
  });

  it('should return multiple posts', async () => {
    // * ========================
    // * Arrange
    // * ========================
    // Create a board.
    const boardCreateResponse = await helper.createBoard({
      name: 'test-board-name3',
    });
    const { id: boardId } = boardCreateResponse.body;
    // Create a user.
    const userCreateResponse = await helper.createUser({
      username: 'test-user-username3',
      password: 'password',
    });
    const { id: userId } = userCreateResponse.body;
    // Create multiple posts.
    let newPosts = [
      {
        subject: 'test-post-subject3',
        text: 'test-post-text3',
        boardId: boardId,
        userId: userId,
      },
      {
        subject: 'test-post-subject4',
        text: 'test-post-text4',
        boardId: boardId,
        userId: userId,
      },
    ];
    for (const newPost of newPosts) {
      await helper.createPost(newPost);
    }
    // * ========================
    // * Act
    // * ========================
    const getPostsResponse = await helper.getPostsByBoardId(boardId);
    // * ========================
    // * Assert
    // * ========================
    expect(getPostsResponse.status).toBe(200);
    const posts = getPostsResponse.body;
    for (let i = 0; i < newPosts.length; i++) {
      expect(posts[i].subject).toBe(newPosts[i].subject);
      expect(posts[i].text).toBe(newPosts[i].text);
      expect(posts[i].boardId).toBe(newPosts[i].boardId);
      expect(posts[i].userId).toBe(newPosts[i].userId);
    }
  });

  it('should update a post', async () => {
    // * ========================
    // * Arrange
    // * ========================
    // Create a board.
    const boardCreateResponse = await helper.createBoard({
      name: 'test-board-name5',
    });
    const { id: boardId } = boardCreateResponse.body;
    // Create a user.
    const userCreateResponse = await helper.createUser({
      username: 'test-user-username5',
      password: 'password',
    });
    const { id: userId } = userCreateResponse.body;
    // Create a post.
    const newPost = {
      subject: 'test-post-subject5',
      text: 'test-post-text5',
      boardId: boardId,
      userId: userId,
    };
    const postCreateResponse = await helper.createPost(newPost);
    const { id: postId } = postCreateResponse.body;
    // * ========================
    // * Act
    // * ========================
    const updatedPost = {
      id: postId,
      subject: 'updated-test-post-subject5',
      text: 'updated-test-post-text5',
      boardId: boardId,
      userId: userId,
    };
    const postUpdateResponse = await helper.updatePost(postId, updatedPost);
    // * ========================
    // * Assert
    // * ========================
    expect(postUpdateResponse.status).toBe(200);
    const post = postUpdateResponse.body;
    expect(post.subject).toBe(updatedPost.subject);
    expect(post.text).toBe(updatedPost.text);
    expect(post.boardId).toBe(updatedPost.boardId);
    expect(post.userId).toBe(updatedPost.userId);
  });

  it('should delete a post', async () => {
    // * ========================
    // * Arrange
    // * ========================
    // Create a board.
    const boardCreateResponse = await helper.createBoard({
      name: 'test-board-name6',
    });
    const { id: boardId } = boardCreateResponse.body;
    // Create a user.
    const userCreateResponse = await helper.createUser({
      username: 'test-user-username6',
      password: 'password',
    });
    const { id: userId } = userCreateResponse.body;
    // Create a post.
    const newPost = {
      subject: 'test-post-subject6',
      text: 'test-post-text6',
      boardId: boardId,
      userId: userId,
    };
    const postCreateResponse = await helper.createPost(newPost);
    const { id: postId } = postCreateResponse.body;
    // * ========================
    // * Act
    // * ========================
    const postDeleteResponse = await helper.deletePost(postId);
    // * ========================
    // * Assert
    // * ========================
    expect(postDeleteResponse.status).toBe(202);
    const postGetResponse = await helper.getPost(postId);
    expect(postGetResponse.status).toBe(404);
  });
});
