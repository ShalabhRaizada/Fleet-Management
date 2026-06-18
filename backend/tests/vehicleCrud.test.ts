import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './testApp';
import { loginAs, TEST_USERS } from './helpers';

describe('Vehicle Master CRUD + validation', () => {
  let token: string;

  beforeAll(async () => {
    token = await loginAs(TEST_USERS.fleetManager);
  });

  it('lists vehicles with pagination envelope', async () => {
    const res = await request(app).get('/api/vehicles?page=1&pageSize=2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeLessThanOrEqual(2);
    expect(res.body.data).toHaveProperty('total');
  });

  it('rejects create with missing mandatory fields', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ registration_no: 'AB12CD3456' }); // missing ownership_type, vehicle_category, etc.
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('rejects create with invalid enum value for fuel_type', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        registration_no: 'AB12CD3456',
        ownership_type: 'Owned',
        vehicle_category: 'HCV',
        vehicle_type: 'Truck',
        fuel_type: 'Petrol', // not in allowed enum
        status: 'Available',
      });
    expect(res.status).toBe(422);
  });

  it('creates, fetches, updates, and soft-deletes a vehicle (full CRUD cycle)', async () => {
    const createRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        registration_no: 'TN09AA1111',
        ownership_type: 'Owned',
        vehicle_category: 'LCV',
        vehicle_type: 'Mini Truck',
        fuel_type: 'Diesel',
        status: 'Available',
      });
    expect(createRes.status).toBe(201);
    const vehicleId = createRes.body.data.vehicle_id;

    const getRes = await request(app).get(`/api/vehicles/${vehicleId}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.registration_no).toBe('TN09AA1111');

    const updateRes = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        registration_no: 'TN09AA1111',
        ownership_type: 'Owned',
        vehicle_category: 'LCV',
        vehicle_type: 'Mini Truck',
        fuel_type: 'Diesel',
        status: 'UnderMaintenance',
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('UnderMaintenance');

    const deleteRes = await request(app).delete(`/api/vehicles/${vehicleId}`).set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);

    const getAfterDelete = await request(app).get(`/api/vehicles/${vehicleId}`).set('Authorization', `Bearer ${token}`);
    expect(getAfterDelete.status).toBe(404);
  });

  it('returns 404 for a non-existent vehicle id', async () => {
    const res = await request(app)
      .get('/api/vehicles/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('searches vehicles by registration number via ?q=', async () => {
    const res = await request(app).get('/api/vehicles?q=DL01AB').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.some((v: any) => v.registration_no === 'DL01AB1234')).toBe(true);
  });
});
