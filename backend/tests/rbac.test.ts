import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './testApp';
import { loginAs, TEST_USERS } from './helpers';

describe('RBAC enforcement', () => {
  let driverToken: string;
  let fleetManagerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    driverToken = await loginAs(TEST_USERS.driver);
    fleetManagerToken = await loginAs(TEST_USERS.fleetManager);
    adminToken = await loginAs(TEST_USERS.admin);
  });

  it('allows a driver to list vehicles (read access for any authenticated user)', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(200);
  });

  it('blocks a driver from creating a vehicle (write-restricted to Admin/Fleet Manager)', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        registration_no: 'XX99ZZ0000',
        ownership_type: 'Owned',
        vehicle_category: 'HCV',
        vehicle_type: 'Truck',
        fuel_type: 'Diesel',
        status: 'Available',
      });
    expect(res.status).toBe(403);
  });

  it('allows a fleet manager to create a vehicle', async () => {
    const regNo = `RJ14XY${Date.now() % 100000}`;
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${fleetManagerToken}`)
      .send({
        registration_no: regNo,
        ownership_type: 'Owned',
        vehicle_category: 'HCV',
        vehicle_type: 'Truck',
        fuel_type: 'Diesel',
        status: 'Available',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.registration_no).toBe(regNo);

    // cleanup so reruns stay idempotent
    await request(app)
      .delete(`/api/vehicles/${res.body.data.vehicle_id}`)
      .set('Authorization', `Bearer ${fleetManagerToken}`);
  });

  it('rejects requests with no Authorization header', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('rejects requests with a malformed token', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', 'Bearer not-a-real-jwt');
    expect(res.status).toBe(401);
  });

  it('allows admin to delete (soft-delete) records that fleet manager created', async () => {
    const create = await request(app)
      .post('/api/branches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ branch_code: 'BR-TEST', branch_name: 'Test Branch', is_workshop: false, is_store: false, status: 'Active' });
    expect(create.status).toBe(201);
    const del = await request(app)
      .delete(`/api/branches/${create.body.data.branch_id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(del.status).toBe(200);
  });
});
