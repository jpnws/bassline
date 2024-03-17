import { describe, afterAll, it, expect, beforeAll } from 'bun:test';

import Helper from 'tests/api/helper';

describe('Demo Admin Signin API', () => {
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

  it('should sign in as a demo admin', async () => {
    const signInDemoAdminResponse = await helper.signInDemoAdmin();
    expect(signInDemoAdminResponse.status).toBe(200);
    expect(signInDemoAdminResponse.body).toBeDefined();
    expect(signInDemoAdminResponse.body).toBeObject();
    expect(signInDemoAdminResponse.body.data).toBeDefined();
    expect(signInDemoAdminResponse.body.data).toBeObject();
    expect(signInDemoAdminResponse.body.data.token).toBeDefined();
    expect(signInDemoAdminResponse.body.data.token).toBeString();
    const token = signInDemoAdminResponse.body.data.token;
    const bearer = `Bearer ${token}`;
    const getCurrentUserResponse = await helper.getCurrentUser({
      Authorization: bearer,
    });
    expect(getCurrentUserResponse.status).toBe(200);
    const user = getCurrentUserResponse.body.data.user;
    expect(user.id).toBeDefined();
    expect(user.username).toContain('admin-');
    expect(user.role).toBeDefined();
    expect(user.role).toBe('ADMIN');
  });
});
