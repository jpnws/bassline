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
    expect(signOutResponse.headers).toBeObject();
    expect(signOutResponse.headers['set-cookie']).not.toBeUndefined();
    const signOutCookies = signOutResponse.headers['set-cookie'];
    let authCookie = '';
    for (const cookie of signOutCookies) {
      if (cookie.includes('auth=')) {
        authCookie = cookie;
      }
    }
    expect(authCookie).not.toBeEmpty();
    const authCookieArray = authCookie.split('; ');
    expect(authCookieArray.includes('auth=')).toBeTrue();
    expect(authCookieArray.includes('Max-Age=0')).toBeTrue();
    expect(authCookieArray.includes('Path=/')).toBeTrue();
    expect(authCookieArray.includes('HttpOnly')).toBeTrue();
  });
});
