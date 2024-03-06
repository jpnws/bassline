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

  // it('should update a post', async () => {
  //   // * ========================
  //   // * Arrange
  //   // * ========================
  //   const boardCreateResponse = await helper.createBoard({
  //     name: 'test-board-name5',
  //   });
  //   const { id: boardId } = boardCreateResponse.body;
  //   const userCreateResponse = await helper.createUser({
  //     username: 'test-user-username5',
  //     password: 'password',
  //   });
  //   const { id: userId } = userCreateResponse.body;
  //   const newPost = {
  //     subject: 'test-post-subject5',
  //     text: 'test-post-text5',
  //     boardId: boardId,
  //     userId: userId,
  //   };
  //   const postCreateResponse = await helper.createPost(newPost);
  //   const { id: postId } = postCreateResponse.body;
  //   // * ========================
  //   // * Act
  //   // * ========================
  //   const updatedPost = {
  //     id: postId,
  //     subject: 'updated-test-post-subject5',
  //     text: 'updated-test-post-text5',
  //     boardId: boardId,
  //     userId: userId,
  //   };
  //   const postUpdateResponse = await helper.updatePost(postId, updatedPost);
  //   // * ========================
  //   // * Assert
  //   // * ========================
  //   expect(postUpdateResponse.status).toBe(200);
  //   const post = postUpdateResponse.body;
  //   expect(post.subject).toBe(updatedPost.subject);
  //   expect(post.text).toBe(updatedPost.text);
  //   expect(post.boardId).toBe(updatedPost.boardId);
  //   expect(post.userId).toBe(updatedPost.userId);
  // });

  // it('should delete a post', async () => {
  //   // * ========================
  //   // * Arrange
  //   // * ========================
  //   const boardCreateResponse = await helper.createBoard({
  //     name: 'test-board-name6',
  //   });
  //   const { id: boardId } = boardCreateResponse.body;
  //   const userCreateResponse = await helper.createUser({
  //     username: 'test-user-username6',
  //     password: 'password',
  //   });
  //   const { id: userId } = userCreateResponse.body;
  //   const newPost = {
  //     subject: 'test-post-subject6',
  //     text: 'test-post-text6',
  //     boardId: boardId,
  //     userId: userId,
  //   };
  //   const postCreateResponse = await helper.createPost(newPost);
  //   const { id: postId } = postCreateResponse.body;
  //   // * ========================
  //   // * Act
  //   // * ========================
  //   const postDeleteResponse = await helper.deletePost(postId);
  //   // * ========================
  //   // * Assert
  //   // * ========================
  //   expect(postDeleteResponse.status).toBe(202);
  //   const postGetResponse = await helper.getPost(postId);
  //   expect(postGetResponse.status).toBe(404);
  // });

  // it('should return posts by board id', async () => {
  //   // * ========================
  //   // * Arrange
  //   // * ========================
  //   const boardCreateResponse = await helper.createBoard({
  //     name: 'test-board-name7',
  //   });
  //   const { id: boardId } = boardCreateResponse.body;
  //   const userCreateResponse = await helper.createUser({
  //     username: 'test-user-username7',
  //     password: 'password',
  //   });
  //   const { id: userId } = userCreateResponse.body;
  //   let newPosts = [
  //     {
  //       subject: 'test-post-subject7',
  //       text: 'test-post-text3',
  //       boardId: boardId,
  //       userId: userId,
  //     },
  //     {
  //       subject: 'test-post-subject7',
  //       text: 'test-post-text4',
  //       boardId: boardId,
  //       userId: userId,
  //     },
  //   ];
  //   for (const newPost of newPosts) {
  //     await helper.createPost(newPost);
  //   }
  //   // * ========================
  //   // * Act
  //   // * ========================
  //   const getPostsResponse = await helper.getPostsByBoardId(boardId);
  //   // * ========================
  //   // * Assert
  //   // * ========================
  //   expect(getPostsResponse.status).toBe(200);
  //   const posts = getPostsResponse.body;
  //   for (let i = 0; i < newPosts.length; i++) {
  //     expect(posts[i].subject).toBe(newPosts[i]?.subject);
  //     expect(posts[i].text).toBe(newPosts[i]?.text);
  //     expect(posts[i].boardId).toBe(newPosts[i]?.boardId);
  //     expect(posts[i].userId).toBe(newPosts[i]?.userId);
  //   }
  // });

  // it('should return true if a user is the author of a post', async () => {
  //   // * ========================
  //   // * Arrange
  //   // * ========================
  //   const newBoard = {
  //     name: 'test-board-name8',
  //   };
  //   const boardCreateResponse = await helper.createBoard(newBoard);
  //   const { id: boardId } = boardCreateResponse.body;
  //   const newUser = {
  //     username: 'superman',
  //     password: 'password',
  //   };
  //   const signUpUserResponse = await helper.signUpUser(newUser);
  //   expect(signUpUserResponse.status).toBe(201);
  //   const { data } = signUpUserResponse.body;
  //   const { user } = data;
  //   const cookies = signUpUserResponse.get('Set-Cookie');
  //   const newPost = {
  //     subject: 'test-post-subject7',
  //     text: 'test-post-text7',
  //     boardId: boardId,
  //     userId: user.id,
  //   };
  //   const postCreateResponse = await helper.createPost(newPost, {
  //     Cookie: cookies,
  //   });
  //   expect(postCreateResponse.status).toBe(201);
  //   const { id: postId } = postCreateResponse.body;
  //   // * ========================
  //   // * Act
  //   // * ========================
  //   const postGetResponse = await helper.getPost(postId, { Cookie: cookies });
  //   expect(postGetResponse.status).toBe(200);
  //   const { data: postGetData } = postGetResponse.body;
  //   const { post: postData, user: userData } = postGetData;
  //   expect(postData.boardName).toBe(newBoard.name);
  //   expect(postData.username).toBe(newUser.username);
  //   expect(postData.subject).toBe(newPost.subject);
  //   expect(postData.text).toBe(newPost.text);
  //   expect(userData.isAuthor).toBe(true);
  //   expect(userData.isAdmin).toBe(false);
  // });
});
