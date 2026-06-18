import request from 'supertest';
import { app } from './testApp';

export async function loginAs(login_id: string, password = 'Password@123'): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ login_id, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${login_id}: ${JSON.stringify(res.body)}`);
  }
  return res.body.data.accessToken;
}

export const TEST_USERS = {
  admin: 'admin@fleet.test',
  fleetManager: 'fleetmanager@fleet.test',
  workshopSupervisor: 'workshop@fleet.test',
  driver: 'driver1@fleet.test',
  approver: 'approver@fleet.test',
};
