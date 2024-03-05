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

  it('should deny empty username and password inputs', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUsers = [
      {
        username: '',
        password: '',
      },
      {
        username: 'username',
        password: '',
      },
      {
        username: '',
        password: 'password',
      },
    ];
    // * ========================
    // * Act
    // * ========================
    const signUpUserResponses = [];
    for (const newUser of newUsers) {
      signUpUserResponses.push(await helper.signUpUser(newUser));
    }
    // * ========================
    // * Assert
    // * ========================
    for (const signUpUserResponse of signUpUserResponses) {
      expect(signUpUserResponse.status).toBe(400);
    }
  });

  it('should deny when username already exists', async () => {
    // * ========================
    // * Arrange
    // * ========================
    await helper.prisma?.user.create({
      data: {
        username: 'johndoe',
        hash: 'hash',
      },
    });
    // * ========================
    // * Act
    // * ========================
    const newUser = {
      username: 'johndoe',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(signUpUserResponse.status).toBe(400);
  });

  it('should singup and create a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'janedoe',
      password: 'password',
    };
    // * ========================
    // * Act
    // * ========================
    const signUpUserResponse = await helper.signUpUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(signUpUserResponse.status).toBe(201);
    const userExists = await helper.prisma?.user.findUnique({
      where: {
        username: newUser.username,
      },
      select: {
        id: true,
      },
    });
    expect(userExists).not.toBeNull();
  });

  it('should produce a cookie with jwt', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'superman',
      password: 'password',
    };
    // * ========================
    // * Act
    // * ========================
    const signUpUserResponse = await helper.signUpUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(signUpUserResponse.status).toBe(201);
    expect(signUpUserResponse.headers).toBeObject();
    expect(signUpUserResponse.headers['set-cookie']).not.toBeUndefined();
    const cookies = signUpUserResponse.headers['set-cookie'];
    let authCookie = '';
    for (const cookie of cookies) {
      if (cookie.includes('Authorization=')) {
        authCookie = cookie;
      }
    }
    expect(authCookie).not.toBeEmpty();
    const authCookieArray = authCookie.split(';');
    expect(authCookieArray.some((str) => /Path/.test(str))).toBeTrue();
    expect(authCookieArray.some((str) => /Max\-Age/.test(str))).toBeTrue();
    expect(authCookieArray.some((str) => /HttpOnly/.test(str))).toBeTrue();
  });
});