import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './testApp';
import { loginAs, TEST_USERS } from './helpers';

describe('Other P1 entities: CRUD + validation', () => {
  let token: string;
  let vehicleId: string;
  let trailerId: string;
  let branchId: string;

  beforeAll(async () => {
    token = await loginAs(TEST_USERS.fleetManager);
    const vehicles = await request(app).get('/api/vehicles?pageSize=1').set('Authorization', `Bearer ${token}`);
    vehicleId = vehicles.body.data.items[0].vehicle_id;
    branchId = vehicles.body.data.items[0].branch_id;
    const trailers = await request(app).get('/api/trailers?pageSize=1').set('Authorization', `Bearer ${token}`);
    trailerId = trailers.body.data.items[0].trailer_id;
  });

  describe('Trailer Master', () => {
    it('rejects create with invalid status enum', async () => {
      const res = await request(app)
        .post('/api/trailers')
        .set('Authorization', `Bearer ${token}`)
        .send({ trailer_no: 'TRL-TEST-1', trailer_type: 'Flatbed', status: 'NotARealStatus' });
      expect(res.status).toBe(422);
    });

    it('creates and soft-deletes a trailer', async () => {
      const createRes = await request(app)
        .post('/api/trailers')
        .set('Authorization', `Bearer ${token}`)
        .send({ trailer_no: `TRL${Date.now() % 1000000}`, trailer_type: 'Flatbed', status: 'Available', branch_id: branchId });
      expect(createRes.status).toBe(201);
      const id = createRes.body.data.trailer_id;

      const delRes = await request(app).delete(`/api/trailers/${id}`).set('Authorization', `Bearer ${token}`);
      expect(delRes.status).toBe(200);
    });
  });

  describe('Fuel Transaction', () => {
    it('rejects create with non-positive quantity', async () => {
      const res = await request(app)
        .post('/api/fuel-transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          vehicle_id: vehicleId,
          fuel_type: 'Diesel',
          txn_datetime: new Date().toISOString(),
          quantity: -5,
          unit_of_measure: 'L',
          rate_per_unit: 90,
          amount: -450,
        });
      expect(res.status).toBe(422);
    });

    it('creates a fuel transaction', async () => {
      const res = await request(app)
        .post('/api/fuel-transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          vehicle_id: vehicleId,
          fuel_type: 'Diesel',
          txn_datetime: new Date().toISOString(),
          quantity: 50,
          unit_of_measure: 'L',
          rate_per_unit: 92.5,
          amount: 4625,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.vehicle_id).toBe(vehicleId);
    });
  });

  describe('Asset Compliance', () => {
    it('rejects create with invalid asset_type', async () => {
      const res = await request(app)
        .post('/api/compliance')
        .set('Authorization', `Bearer ${token}`)
        .send({
          asset_type: 'Drone',
          asset_id: vehicleId,
          compliance_type_code: 'INSURANCE',
          valid_upto: '2027-01-01',
          status: 'Valid',
        });
      expect(res.status).toBe(422);
    });

    it('creates a compliance record for a vehicle', async () => {
      const res = await request(app)
        .post('/api/compliance')
        .set('Authorization', `Bearer ${token}`)
        .send({
          asset_type: 'Vehicle',
          asset_id: vehicleId,
          compliance_type_code: 'INSURANCE',
          valid_upto: '2027-01-01',
          status: 'Valid',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('Valid');
    });
  });

  describe('Job Card', () => {
    it('rejects create with missing defect_summary', async () => {
      const res = await request(app)
        .post('/api/job-cards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          job_card_no: 'JC-MISSING-FIELD',
          job_card_type: 'Breakdown',
          vehicle_id: vehicleId,
          reported_datetime: new Date().toISOString(),
          priority: 'High',
          opened_at: new Date().toISOString(),
        });
      expect(res.status).toBe(422);
    });
  });

  describe('Workshop Master', () => {
    it('creates a workshop', async () => {
      const res = await request(app)
        .post('/api/workshops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workshop_code: `WS-TEST-${Date.now()}`,
          workshop_name: 'Test Workshop',
          workshop_type: 'External',
          status: 'Active',
        });
      expect(res.status).toBe(201);
    });
  });

  describe('Tyre Master', () => {
    it('rejects create with invalid status enum', async () => {
      const res = await request(app)
        .post('/api/tyres')
        .set('Authorization', `Bearer ${token}`)
        .send({ tyre_serial_no: `TYR-TEST-${Date.now()}`, size: '295/80R22.5', status: 'OnFire' });
      expect(res.status).toBe(422);
    });

    it('creates a tyre', async () => {
      const res = await request(app)
        .post('/api/tyres')
        .set('Authorization', `Bearer ${token}`)
        .send({ tyre_serial_no: `TYR-TEST-${Date.now()}`, size: '295/80R22.5', status: 'InStock' });
      expect(res.status).toBe(201);
    });
  });

  describe('Accessory Master', () => {
    it('creates an accessory', async () => {
      const res = await request(app)
        .post('/api/accessories')
        .set('Authorization', `Bearer ${token}`)
        .send({ accessory_code: `ACC-TEST-${Date.now()}`, accessory_type: 'GPS', status: 'InStock' });
      expect(res.status).toBe(201);
    });
  });

  describe('Accompaniment Master', () => {
    it('rejects create with invalid accompaniment_type', async () => {
      const res = await request(app)
        .post('/api/accompaniments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accompaniment_code: `ACMP-TEST-${Date.now()}`,
          accompaniment_type: 'MagicCarpet',
          is_reusable: true,
          current_status: 'Available',
        });
      expect(res.status).toBe(422);
    });

    it('creates an accompaniment', async () => {
      const res = await request(app)
        .post('/api/accompaniments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          accompaniment_code: `ACMP-TEST-${Date.now()}`,
          accompaniment_type: 'Tarpaulin',
          is_reusable: true,
          current_status: 'Available',
        });
      expect(res.status).toBe(201);
    });
  });
});
