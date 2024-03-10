import { describe, afterAll, it, expect, beforeAll } from 'bun:test';

import { UserRole } from '@prisma/client';

import Helper from 'tests/api/helper';

describe('Users API', () => {
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
    const adminUser = {
      username: 'admin-user-username1',
      password: 'password',
    };
    await helper.prisma?.user.create({
      data: {
        username: adminUser.username,
        hash: await Bun.password.hash(adminUser.password),
        role: UserRole.ADMIN,
      },
    });
    const signInUserResponse = await helper.signInUser(adminUser);
    const token = signInUserResponse.body.data.token;
    // * ========================
    // * Act
    // * ========================
    const newUser = {
      username: 'test-user-username1',
      password: 'password',
    };
    const userCreateResponse = await helper.createUser(newUser, {
      Authorization: `Bearer ${token}`,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(userCreateResponse.status).toBe(201);
    expect(userCreateResponse.body).toBeDefined();
    expect(userCreateResponse.body.data).toBeDefined();
    expect(userCreateResponse.body.data.user).toBeDefined();
    const user = userCreateResponse.body.data.user;
    expect(user.id).toBeDefined();
    expect(user.username).toBe('test-user-username1');
    expect(user.role).toBe('MEMBER');
  });

  it('should return a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const adminUser = {
      username: 'admin-user-username2',
      password: 'password',
    };
    await helper.prisma?.user.create({
      data: {
        username: adminUser.username,
        hash: await Bun.password.hash(adminUser.password),
        role: UserRole.ADMIN,
      },
    });
    const signInUserResponse = await helper.signInUser(adminUser);
    const token = signInUserResponse.body.data.token;
    const newUser = {
      username: 'test-user-username2',
      password: 'password',
    };
    const createUserResponse = await helper.createUser(newUser, {
      Authorization: `Bearer ${token}`,
    });
    expect(createUserResponse.status).toBe(201);
    expect(createUserResponse.body).toBeDefined();
    expect(createUserResponse.body.data).toBeDefined();
    expect(createUserResponse.body.data.user).toBeDefined();
    const createUserData = createUserResponse.body.data.user;
    expect(createUserData.id).toBeDefined();
    expect(createUserData.username).toBe(newUser.username);
    expect(createUserData.role).toBe('MEMBER');
    // * ========================
    // * Act
    // * ========================
    const getUserResponse = await helper.getUser(createUserData.id, {
      Authorization: `Bearer ${token}`,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(getUserResponse.status).toBe(200);
    expect(getUserResponse.body).toBeDefined();
    expect(getUserResponse.body.data).toBeDefined();
    expect(getUserResponse.body.data.user).toBeDefined();
    const user = getUserResponse.body.data.user;
    expect(user.id).toBe(createUserData.id);
    expect(user.username).toBe(newUser.username);
    expect(user.role).toBe('MEMBER');
  });

  // it('should update a user', async () => {
  //   // * ========================
  //   // * Arrange
  //   // * ========================
  //   const newUser = {
  //     username: 'test-user-username3',
  //     password: 'password',
  //   };
  //   const userCreateResponse = await helper.createUser(newUser);
  //   const { id: userId } = userCreateResponse.body;
  //   // * ========================
  //   // * Act
  //   // * ========================
  //   const updatedUser = {
  //     username: 'test-user-username4',
  //   };
  //   const userUpdateResponse = await helper.updateUser(userId, updatedUser);
  //   // * ========================
  //   // * Assert
  //   // * ========================
  //   expect(userUpdateResponse.status).toBe(200);
  //   const user = userUpdateResponse.body;
  //   expect(user.username).toBe('test-user-username4');
  // });

  // it('should delete a user', async () => {
  //   // * ========================
  //   // * Arrange
  //   // * ========================
  //   const newUser = {
  //     username: 'test-user-username5',
  //     password: 'password',
  //   };
  //   const userCreateResponse = await helper.createUser(newUser);
  //   const { id: userId } = userCreateResponse.body;
  //   // * ========================
  //   // * Act
  //   // * ========================
  //   const userDeleteResponse = await helper.deleteUser(userId);
  //   // * ========================
  //   // * Assert
  //   // * ========================
  //   expect(userDeleteResponse.status).toBe(202);
  //   const userGetResponse = await helper.getUser(userId);
  //   expect(userGetResponse.status).toBe(404);
  // });

  // it('should retrieve the current user', async () => {
  //   // * ========================
  //   // * Arrange
  //   // * ========================
  //   const newUser = {
  //     username: 'janedoe',
  //     password: 'password',
  //   };
  //   const signUpUserResponse = await helper.signUpUser(newUser);
  //   expect(signUpUserResponse.body.data.token).toBeDefined();
  //   expect(signUpUserResponse.body.data.token).toBeString();
  //   const token = signUpUserResponse.body.data.token;
  //   const bearer = `Bearer ${token}`;
  //   // * ========================
  //   // * Act
  //   // * ========================
  //   const getCurrentUserResponse = await helper.getCurrentUser({
  //     Authorization: bearer,
  //   });
  //   // * ========================
  //   // * Assert
  //   // * ========================
  //   expect(getCurrentUserResponse.status).toBe(200);
  //   const user = getCurrentUserResponse.body.data.user;
  //   expect(user.id).toBeDefined();
  //   expect(user.username).toBe(newUser.username);
  //   expect(user.role).toBeDefined();
  // });
});
