import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import Helper from 'tests/api/helper';

describe('Signup API', () => {
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

  it('should deny username less than 6 characters', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'ueser',
      password: 'password',
    };
    // * ========================
    // * Act
    // * ========================
    const signUpUserResponse = await helper.signUpUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(signUpUserResponse.status).toBe(400);
  });

  it('should deny username more than 12 characters', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'usernamelongerthan12characters',
      password: 'password',
    };
    // * ========================
    // * Act
    // * ========================
    const signUpUserResponse = await helper.signUpUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(signUpUserResponse.status).toBe(400);
  });

  it('should deny username with special characters', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'user@name',
      password: 'password',
    };
    // * ========================
    // * Act
    // * ========================
    const signUpUserResponse = await helper.signUpUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(signUpUserResponse.status).toBe(400);
  });

  it('should deny password less than 6 characters', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'username',
      password: 'pass',
    };
    // * ========================
    // * Act
    // * ========================
    const signUpUserResponse = await helper.signUpUser(newUser);
    // * ========================
    // * Assert
    // * ========================
    expect(signUpUserResponse.status).toBe(400);
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

  it('should return with a token', async () => {
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
    expect(signUpUserResponse.body).toBeDefined();
    expect(signUpUserResponse.body).toBeObject();
    expect(signUpUserResponse.body.data).toBeDefined();
    expect(signUpUserResponse.body.data).toBeObject();
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
  });

  it('should not allow signup while signed in', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser1 = {
      username: 'spiderman',
      password: 'password',
    };
    const signUpUserResponse = await helper.signUpUser(newUser1);
    expect(signUpUserResponse.body).toBeDefined();
    expect(signUpUserResponse.body).toBeObject();
    expect(signUpUserResponse.body.data).toBeDefined();
    expect(signUpUserResponse.body.data).toBeObject();
    expect(signUpUserResponse.body.data.token).toBeDefined();
    expect(signUpUserResponse.body.data.token).toBeString();
    const token = signUpUserResponse.body.data.token;
    const bearer = `Bearer ${token}`;
    // * ========================
    // * Act
    // * ========================
    const newUser2 = {
      username: 'ironman',
      password: 'password',
    };
    const newUserResponse2 = await helper.signUpUser(newUser2, {
      Authorization: bearer,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(newUserResponse2.status).toBe(409);
  });
});
