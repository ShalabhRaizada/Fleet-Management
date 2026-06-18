import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './testApp';

describe('Auth', () => {
  it('logs in with valid seeded admin credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      login_id: 'admin@fleet.test',
      password: 'Password@123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
    expect(res.body.data.user.role_code).toBe('ADMIN');
  });

  it('rejects invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      login_id: 'admin@fleet.test',
      password: 'wrong-password',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unknown login_id', async () => {
    const res = await request(app).post('/api/auth/login').send({
      login_id: 'nobody@fleet.test',
      password: 'whatever',
    });
    expect(res.status).toBe(401);
  });

  it('rejects malformed login body', async () => {
    const res = await request(app).post('/api/auth/login').send({ login_id: '' });
    expect(res.status).toBe(400);
  });

  it('returns the current user profile for a valid access token', async () => {
    const login = await request(app).post('/api/auth/login').send({
      login_id: 'fleetmanager@fleet.test',
      password: 'Password@123',
    });
    const token = login.body.data.accessToken;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.login_id).toBe('fleetmanager@fleet.test');
  });

  it('rejects /me with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('issues a new access token via refresh token', async () => {
    const login = await request(app).post('/api/auth/login').send({
      login_id: 'admin@fleet.test',
      password: 'Password@123',
    });
    const refreshToken = login.body.data.refreshToken;
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('rejects an invalid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'not-a-real-token' });
    expect(res.status).toBe(401);
  });
});
