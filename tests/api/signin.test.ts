import { describe, afterAll, it, expect, beforeAll } from 'bun:test';

import Helper from 'tests/api/helper';

describe('Signin API', () => {
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
    const signInUserResponses = [];
    for (const newUser of newUsers) {
      signInUserResponses.push(await helper.signInUser(newUser));
    }
    // * ========================
    // * Assert
    // * ========================
    for (const signInUserResponse of signInUserResponses) {
      expect(signInUserResponse.status).toBe(401);
    }
  });

  it('should deny when username does not exist', async () => {
    // * ========================
    // * Arrange
    // * ========================
    await helper.prisma?.user.create({
      data: {
        username: 'johndoe',
        hash: 'password',
      },
    });
    // * ========================
    // * Act
    // * ========================
    const newUser = {
      username: 'anderson',
      password: 'password',
    };
    const signInUserResponse = await helper.signInUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(signInUserResponse.status).toBe(401);
  });

  it('should sign in a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'janedoe',
      password: 'password',
    };
    await helper.signUpUser(newUser);
    // * ========================
    // * Act
    // * ========================
    const signInUserResponse = await helper.signInUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(signInUserResponse.status).toBe(200);
  });

  it('should retrieve a token when a user signins', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'superman',
      password: 'password',
    };
    await helper.signUpUser(newUser);
    // * ========================
    // * Act
    // * ========================
    const signInUserResponse = await helper.signInUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(signInUserResponse.status).toBe(200);
    expect(signInUserResponse.body).toBeDefined();
    expect(signInUserResponse.body).toBeObject();
    expect(signInUserResponse.body.data).toBeDefined();
    expect(signInUserResponse.body.data).toBeObject();
    expect(signInUserResponse.body.data.token).toBeDefined();
    expect(signInUserResponse.body.data.token).toBeString();
  });
});
