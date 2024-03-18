import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import Helper from 'tests/api/helper';

describe('Demo User Signin API', () => {
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

  it('should sign in as a demo user', async () => {
    const signInDemoUserResponse = await helper.signInDemoUser();
    expect(signInDemoUserResponse.status).toBe(200);
    expect(signInDemoUserResponse.body).toBeDefined();
    expect(signInDemoUserResponse.body).toBeObject();
    expect(signInDemoUserResponse.body.data).toBeDefined();
    expect(signInDemoUserResponse.body.data).toBeObject();
    expect(signInDemoUserResponse.body.data.token).toBeDefined();
    expect(signInDemoUserResponse.body.data.token).toBeString();
    const token = signInDemoUserResponse.body.data.token;
    const bearer = `Bearer ${token}`;
    const getCurrentUserResponse = await helper.getCurrentUser({
      Authorization: bearer,
    });
    expect(getCurrentUserResponse.status).toBe(200);
    const user = getCurrentUserResponse.body.data.user;
    expect(user.id).toBeDefined();
    expect(user.username).toContain('u_');
    expect(user.role).toBeDefined();
    expect(user.role).toBe('MEMBER');
  });
});
