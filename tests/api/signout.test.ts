import { describe, afterAll, it, expect, beforeAll } from 'bun:test';

import Helper from 'tests/api/helper';

describe('Signout API', () => {
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

  it('should sign out a user', async () => {
    // * ========================
    // * Arrange
    // * ========================
    const newUser = {
      username: 'spiderman',
      password: 'password',
    };
    const newUserResponse = await helper.signUpUser(newUser);
    expect(newUserResponse.status).toBe(201);
    const signUpCookies = newUserResponse.get('Set-Cookie');
    // * ========================
    // * Act
    // * ========================
    const signOutResponse = await helper.signOutUser({
      Cookie: signUpCookies,
    });
    // * ========================
    // * Assert
    // * ========================
    expect(signOutResponse.status).toBe(200);
  });
});
