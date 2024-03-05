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

  it('should create a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'test-user-username1',
      password: 'password',
    };
    // * ========================
    // * Act
    // * ========================
    const userCreateResponse = await helper.createUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(userCreateResponse.status).toBe(201);
    const user = userCreateResponse.body;
    expect(user.username).toBe('test-user-username1');
  });

  it('should return a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'test-user-username2',
      password: 'password',
    };
    const userCreateResponse = await helper.createUser(newUser);
    const { id: userId } = userCreateResponse.body;
    // * ========================
    // * Act
    // * ========================
    const getUserResponse = await helper.getUser(userId);
    // * ========================
    // * Assert
    // * ========================
    expect(userCreateResponse.status).toBe(201);
    expect(getUserResponse.status).toBe(200);
    const user = getUserResponse.body;
    expect(user.username).toBe('test-user-username2');
  });

  it('should update a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'test-user-username3',
      password: 'password',
    };
    const userCreateResponse = await helper.createUser(newUser);
    const { id: userId } = userCreateResponse.body;
    // * ========================
    // * Act
    // * ========================
    const updatedUser = {
      username: 'test-user-username4',
    };
    const userUpdateResponse = await helper.updateUser(userId, updatedUser);
    // * ========================
    // * Assert
    // * ========================
    expect(userUpdateResponse.status).toBe(200);
    const user = userUpdateResponse.body;
    expect(user.username).toBe('test-user-username4');
  });

  it('should delete a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'test-user-username5',
      password: 'password',
    };
    const userCreateResponse = await helper.createUser(newUser);
    const { id: userId } = userCreateResponse.body;
    // * ========================
    // * Act
    // * ========================
    const userDeleteResponse = await helper.deleteUser(userId);
    // * ========================
    // * Assert
    // * ========================
    expect(userDeleteResponse.status).toBe(202);
    const userGetResponse = await helper.getUser(userId);
    expect(userGetResponse.status).toBe(404);
  });
});
