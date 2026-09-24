require('reflect-metadata');
require('ts-node').register({
  transpileOnly: true,
  project: require('node:path').join(__dirname, '../tsconfig.build.json'),
});

const assert = require('node:assert/strict');
const { describe, it, beforeEach, afterEach, mock } = require('node:test');
const { generateKeyPairSync, sign } = require('node:crypto');
const { OAuth2Client } = require('google-auth-library');
const { GoogleAuthService } = require('../src/auth/google-auth.service.ts');

describe('Google authentication', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  const config = { id: 'test-client', secret: 'test-only' };
  const appTokens = {
    accessToken: 'test-access',
    refreshToken: 'test-refresh',
  };
  let certificates;

  // The real Google verifier checks these signatures; only certificate download
  // and application dependencies are mocked. No Google, database or mail calls.
  function googleToken(claims = {}) {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: 'RS256', kid: 'test-key' }),
    ).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        iss: 'https://accounts.google.com',
        aud: config.id,
        sub: 'incoming-google-id',
        email: 'review@gmail.com',
        email_verified: true,
        iat: now - 60,
        exp: now + 3600,
        ...claims,
      }),
    ).toString('base64url');
    const content = `${header}.${payload}`;
    const signature = sign('RSA-SHA256', Buffer.from(content), privateKey);
    return `${content}.${signature.toString('base64url')}`;
  }

  function fixture(options = {}) {
    const user = {
      id: 7,
      email: 'review@gmail.com',
      googleId: 'incoming-google-id',
      isEmailVerified: true,
      passwordResetVersion: 4,
    };
    const users = {
      findByGoogleId: mock.fn(async () => {
        if (options.databaseError) throw new Error('database unavailable');
        return options.unlinked ? false : user;
      }),
      findByEmail: mock.fn(async () => options.existingUser ?? false),
      updateUser: mock.fn(async () => {}),
      createGoogleUser: mock.fn(async () => user),
    };
    const tokens = {
      generateToken: mock.fn(async () => {
        if (options.signingError) throw new Error('signing failed');
        return appTokens;
      }),
    };
    const service = new GoogleAuthService(
      users,
      tokens,
      options.config ?? config,
    );
    return { service, user, users, tokens };
  }

  async function rejectsStatus(run, status) {
    await assert.rejects(run, (error) => error.getStatus?.() === status);
  }

  beforeEach(() => {
    certificates = mock.method(
      OAuth2Client.prototype,
      'getFederatedSignonCertsAsync',
      async () => ({ certs: { 'test-key': publicKey }, format: 'PEM' }),
    );
  });
  afterEach(() => mock.restoreAll());

  it('signs in a known Google ID without rechecking email or rewriting the account', async () => {
    const { service, users } = fixture();
    const result = await service.authenticate({
      googleToken: googleToken({ email: undefined, email_verified: false }),
    });
    assert.equal(result.data.accessToken, appTokens.accessToken);
    assert.equal(users.findByEmail.mock.callCount(), 0);
    assert.equal(users.updateUser.mock.callCount(), 0);
  });

  for (const [name, claims] of [
    ['expired', { iat: 1, exp: 2 }],
    ['wrong audience', { aud: 'another-app' }],
    ['wrong issuer', { iss: 'https://not-google.invalid' }],
    ['missing Google ID', { sub: undefined }],
  ]) {
    it(`rejects ${name} with 401 before accessing users`, async () => {
      const { service, users } = fixture();
      await rejectsStatus(
        () => service.authenticate({ googleToken: googleToken(claims) }),
        401,
      );
      assert.equal(users.findByGoogleId.mock.callCount(), 0);
    });
  }

  it('rejects a malformed token with 401', async () => {
    const { service } = fixture();
    await rejectsStatus(
      () => service.authenticate({ googleToken: 'not-a-jwt' }),
      401,
    );
  });

  it('rejects an invalid signature with 401', async () => {
    const { service } = fixture();
    const parts = googleToken().split('.');
    parts[2] = Buffer.alloc(256).toString('base64url');
    await rejectsStatus(
      () => service.authenticate({ googleToken: parts.join('.') }),
      401,
    );
  });

  it('returns 503 for a Google certificate download failure', async () => {
    const { service, users } = fixture();
    certificates.mock.mockImplementation(async () => {
      throw new Error(
        'Failed to retrieve verification certificates: connection refused',
      );
    });
    await rejectsStatus(
      () => service.authenticate({ googleToken: googleToken() }),
      503,
    );
    assert.equal(users.findByGoogleId.mock.callCount(), 0);
  });

  for (const failure of ['databaseError', 'signingError']) {
    it(`keeps ${failure} as a server error`, async () => {
      const { service } = fixture({ [failure]: true });
      await rejectsStatus(
        () => service.authenticate({ googleToken: googleToken() }),
        500,
      );
    });
  }

  it('rejects missing client configuration without contacting Google', async () => {
    const { service } = fixture({
      config: { id: undefined, secret: 'test-only' },
    });
    await rejectsStatus(
      () => service.authenticate({ googleToken: googleToken() }),
      500,
    );
    assert.equal(certificates.mock.callCount(), 0);
  });

  for (const verified of [false, undefined]) {
    it(`rejects unlinked users with email_verified=${verified}`, async () => {
      const { service, users, tokens } = fixture({ unlinked: true });
      await rejectsStatus(
        () =>
          service.authenticate({
            googleToken: googleToken({ email_verified: verified }),
          }),
        401,
      );
      assert.equal(users.updateUser.mock.callCount(), 0);
      assert.equal(users.createGoogleUser.mock.callCount(), 0);
      assert.equal(tokens.generateToken.mock.callCount(), 0);
    });
  }

  it('does not replace a different Google ID on a matching email account', async () => {
    const { service, users, tokens } = fixture({
      unlinked: true,
      existingUser: {
        id: 7,
        email: 'review@gmail.com',
        googleId: 'original-google-id',
      },
    });
    await rejectsStatus(
      () => service.authenticate({ googleToken: googleToken() }),
      401,
    );
    assert.equal(users.updateUser.mock.callCount(), 0);
    assert.equal(tokens.generateToken.mock.callCount(), 0);
  });
});
