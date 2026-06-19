import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './testApp';
import { loginAs, TEST_USERS } from './helpers';

describe('Tyre Rotation Management', () => {
  let adminToken: string;
  let vehicleId: string;
  let tyreAId: string;
  let tyreBId: string;

  beforeAll(async () => {
    adminToken = await loginAs(TEST_USERS.admin);

    const vRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        registration_no: `TR${Date.now() % 1000000}`,
        ownership_type: 'Owned',
        vehicle_category: 'HCV',
        vehicle_type: 'Truck',
        fuel_type: 'Diesel',
        axle_configuration: '4x2',
        current_odometer_km: 50000,
        status: 'Available',
      });
    expect(vRes.status).toBe(201);
    vehicleId = vRes.body.data.vehicle_id;

    async function createTyre(serial: string, position: string) {
      const res = await request(app)
        .post('/api/tyres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tyre_serial_no: serial,
          size: '295/80R22.5',
          status: 'Running',
          current_vehicle_id: vehicleId,
          current_position: position,
          total_run_km: 10000,
        });
      expect(res.status).toBe(201);
      return res.body.data.tyre_id;
    }
    tyreAId = await createTyre(`TYRE-A-${Date.now()}`, 'F1L');
    tyreBId = await createTyre(`TYRE-B-${Date.now()}`, 'F1R');
  });

  it('returns the current tyre layout for an asset', async () => {
    const res = await request(app)
      .get(`/api/assets/Vehicle/${vehicleId}/tyre-layout`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.axleConfiguration).toBe('4x2');
    const f1l = res.body.data.positions.find((p: any) => p.positionCode === 'F1L');
    expect(f1l.tyre.tyre_id).toBe(tyreAId);
  });

  it('rejects a rotation with an odometer reading below the asset current odometer', async () => {
    const res = await request(app)
      .post('/api/tyre-rotations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assetType: 'Vehicle',
        assetId: vehicleId,
        rotationDate: new Date().toISOString(),
        odometerReading: 100,
        lines: [
          { tyreId: tyreAId, oldPositionCode: 'F1L', newPositionCode: 'F1R', movementType: 'Rotation' },
          { tyreId: tyreBId, oldPositionCode: 'F1R', newPositionCode: 'F1L', movementType: 'Rotation' },
        ],
      });
    expect(res.status).toBe(422);
  });

  it('rejects a rotation where two tyres target the same destination position', async () => {
    const res = await request(app)
      .post('/api/tyre-rotations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assetType: 'Vehicle',
        assetId: vehicleId,
        rotationDate: new Date().toISOString(),
        odometerReading: 51000,
        lines: [
          { tyreId: tyreAId, oldPositionCode: 'F1L', newPositionCode: 'F1R', movementType: 'Rotation' },
          { tyreId: tyreBId, oldPositionCode: 'F1R', newPositionCode: 'F1R', movementType: 'Rotation' },
        ],
      });
    expect(res.status).toBe(422);
  });

  it('rejects removing a tyre from service without a destination status', async () => {
    const res = await request(app)
      .post('/api/tyre-rotations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assetType: 'Vehicle',
        assetId: vehicleId,
        rotationDate: new Date().toISOString(),
        odometerReading: 51000,
        lines: [{ tyreId: tyreAId, oldPositionCode: 'F1L', movementType: 'Remove' }],
      });
    expect(res.status).toBe(422);
  });

  it('creates a draft, then submits it and applies the swap to tyre_master', async () => {
    const createRes = await request(app)
      .post('/api/tyre-rotations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assetType: 'Vehicle',
        assetId: vehicleId,
        rotationDate: new Date().toISOString(),
        odometerReading: 51000,
        workshopId: null,
        technicianName: 'Ramesh',
        reasonCode: 'Scheduled',
        lines: [
          { tyreId: tyreAId, oldPositionCode: 'F1L', newPositionCode: 'F1R', oldTreadDepth: 8, newTreadDepth: 8, movementType: 'Rotation' },
          { tyreId: tyreBId, oldPositionCode: 'F1R', newPositionCode: 'F1L', oldTreadDepth: 7, newTreadDepth: 7, movementType: 'Rotation' },
        ],
      });
    expect(createRes.status).toBe(201);
    const rotationId = createRes.body.data.rotation_header_id;
    expect(createRes.body.data.status).toBe('Draft');

    const getRes = await request(app)
      .get(`/api/tyre-rotations/${rotationId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.lines).toHaveLength(2);

    const submitRes = await request(app)
      .post(`/api/tyre-rotations/${rotationId}/submit`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.status).toBe('Submitted');

    const layoutRes = await request(app)
      .get(`/api/assets/Vehicle/${vehicleId}/tyre-layout`)
      .set('Authorization', `Bearer ${adminToken}`);
    const f1l = layoutRes.body.data.positions.find((p: any) => p.positionCode === 'F1L');
    const f1r = layoutRes.body.data.positions.find((p: any) => p.positionCode === 'F1R');
    expect(f1l.tyre.tyre_id).toBe(tyreBId);
    expect(f1r.tyre.tyre_id).toBe(tyreAId);

    const approveRes = await request(app)
      .post(`/api/tyre-rotations/${rotationId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('Approved');
  });

  it('returns the current tyre layout for a trailer (axle_count-derived configuration)', async () => {
    const trailerRes = await request(app)
      .post('/api/trailers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ trailer_no: `TRL${Date.now() % 1000000}`, trailer_type: 'Flatbed', axle_count: 2, status: 'Available' });
    expect(trailerRes.status).toBe(201);
    const trailerId = trailerRes.body.data.trailer_id;

    const res = await request(app)
      .get(`/api/assets/Trailer/${trailerId}/tyre-layout`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.axleConfiguration).toBe('2-Axle');
    expect(res.body.data.positions.length).toBeGreaterThan(0);
  });

  it('returns full movement history for a tyre', async () => {
    const res = await request(app)
      .get(`/api/tyres/${tyreAId}/history`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.movements.length).toBeGreaterThan(0);
  });

  it('blocks a driver from creating a rotation (write-restricted role)', async () => {
    const driverToken = await loginAs(TEST_USERS.driver);
    const res = await request(app)
      .post('/api/tyre-rotations')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        assetType: 'Vehicle',
        assetId: vehicleId,
        rotationDate: new Date().toISOString(),
        odometerReading: 52000,
        lines: [{ tyreId: tyreAId, oldPositionCode: 'F1R', newPositionCode: 'F1L', movementType: 'Rotation' }],
      });
    expect(res.status).toBe(403);
  });
});
