import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

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
      username: 'admin_tuser1',
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
      username: 'tuser1',
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
    expect(user.username).toBe('tuser1');
    expect(user.role).toBe('MEMBER');
  });

  it('should return a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const adminUser = {
      username: 'admin_tuser2',
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
      username: 'tuser2',
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

  it('should update a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const adminUser = {
      username: 'admin_tuser3',
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
      username: 'tuser3',
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
    const updatedUser = {
      username: 'tuser2-updated',
      role: UserRole.ADMIN,
    };
    const updateUserResponse = await helper.updateUser(
      createUserData.id,
      updatedUser,
      { Authorization: `Bearer ${token}` },
    );
    // * ========================
    // * Assert
    // * ========================
    expect(updateUserResponse.status).toBe(200);
    expect(updateUserResponse.body).toBeDefined();
    expect(updateUserResponse.body.data).toBeDefined();
    expect(updateUserResponse.body.data.user).toBeDefined();
    const updateUserData = updateUserResponse.body.data.user;
    expect(updateUserData.id).toBe(createUserData.id);
    expect(updateUserData.username).toBe(updatedUser.username);
    expect(updateUserData.role).toBe(updatedUser.role);
  });

  it('should delete a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const adminUser = {
      username: 'admin_tuser4',
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
      username: 'tuser4',
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
    const deleteUserResponse = await helper.deleteUser(createUserData.id, {
      Authorization: `Bearer ${token}`,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(deleteUserResponse.status).toBe(202);
  });

  it('should retrieve the current user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'janedoe',
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
    const getCurrentUserResponse = await helper.getCurrentUser({
      Authorization: bearer,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(getCurrentUserResponse.status).toBe(200);
    const user = getCurrentUserResponse.body.data.user;
    expect(user.id).toBeDefined();
    expect(user.username).toBe(newUser.username);
    expect(user.role).toBeDefined();
  });
});
