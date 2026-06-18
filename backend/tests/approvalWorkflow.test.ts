import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './testApp';
import { loginAs, TEST_USERS } from './helpers';

describe('Approval workflow engine', () => {
  let fleetManagerToken: string;
  let driverToken: string;
  let approverToken: string;
  let vehicleId: string;
  let branchId: string;

  beforeAll(async () => {
    fleetManagerToken = await loginAs(TEST_USERS.fleetManager);
    driverToken = await loginAs(TEST_USERS.driver);
    approverToken = await loginAs(TEST_USERS.approver);

    const vehicles = await request(app)
      .get('/api/vehicles?pageSize=1')
      .set('Authorization', `Bearer ${fleetManagerToken}`);
    vehicleId = vehicles.body.data.items[0].vehicle_id;
    branchId = vehicles.body.data.items[0].branch_id;
  });

  async function createJobCard() {
    const res = await request(app)
      .post('/api/job-cards')
      .set('Authorization', `Bearer ${fleetManagerToken}`)
      .send({
        job_card_no: `JC-TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        job_card_type: 'Breakdown',
        vehicle_id: vehicleId,
        branch_id: branchId,
        reported_datetime: new Date().toISOString(),
        defect_summary: 'Test defect for approval workflow',
        priority: 'High',
        status: 'Open',
        opened_at: new Date().toISOString(),
      });
    expect(res.status).toBe(201);
    return res.body.data.job_card_id;
  }

  it('submits a job card for approval and approves it, advancing job_card.status', async () => {
    const jobCardId = await createJobCard();

    const submitRes = await request(app)
      .post('/api/approvals')
      .set('Authorization', `Bearer ${fleetManagerToken}`)
      .send({ transactionType: 'job_card', transactionId: jobCardId });
    expect(submitRes.status).toBe(201);
    expect(submitRes.body.data.approval_status).toBe('Pending');
    const approvalId = submitRes.body.data.approval_id;

    // non-approver role is blocked from deciding
    const blocked = await request(app)
      .post(`/api/approvals/${approvalId}/decide`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ decision: 'Approved' });
    expect(blocked.status).toBe(403);

    const decideRes = await request(app)
      .post(`/api/approvals/${approvalId}/decide`)
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ decision: 'Approved', remarks: 'Looks good' });
    expect(decideRes.status).toBe(200);
    expect(decideRes.body.data.approval_status).toBe('Approved');

    const jobCard = await request(app)
      .get(`/api/job-cards/${jobCardId}`)
      .set('Authorization', `Bearer ${fleetManagerToken}`);
    expect(jobCard.body.data.status).toBe('Assigned');

    // deciding again on an already-decided request is a conflict
    const redecide = await request(app)
      .post(`/api/approvals/${approvalId}/decide`)
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ decision: 'Rejected' });
    expect(redecide.status).toBe(409);
  });

  it('rejects a job card approval, setting job_card.status to Cancelled', async () => {
    const jobCardId = await createJobCard();

    const submitRes = await request(app)
      .post('/api/approvals')
      .set('Authorization', `Bearer ${fleetManagerToken}`)
      .send({ transactionType: 'job_card', transactionId: jobCardId });
    expect(submitRes.status).toBe(201);
    const approvalId = submitRes.body.data.approval_id;

    const decideRes = await request(app)
      .post(`/api/approvals/${approvalId}/decide`)
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ decision: 'Rejected', remarks: 'Not justified' });
    expect(decideRes.status).toBe(200);
    expect(decideRes.body.data.approval_status).toBe('Rejected');

    const jobCard = await request(app)
      .get(`/api/job-cards/${jobCardId}`)
      .set('Authorization', `Bearer ${fleetManagerToken}`);
    expect(jobCard.body.data.status).toBe('Cancelled');
  });

  it('lists approval requests with status filter', async () => {
    const res = await request(app)
      .get('/api/approvals?status=Approved')
      .set('Authorization', `Bearer ${fleetManagerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.every((a: any) => a.approval_status === 'Approved')).toBe(true);
  });

  it('rejects submitting approval with invalid transactionType', async () => {
    const res = await request(app)
      .post('/api/approvals')
      .set('Authorization', `Bearer ${fleetManagerToken}`)
      .send({ transactionType: 'not_a_real_type', transactionId: vehicleId });
    expect(res.status).toBe(422);
  });

  it('returns 404 when deciding a non-existent approval request', async () => {
    const res = await request(app)
      .post('/api/approvals/00000000-0000-0000-0000-000000000000/decide')
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ decision: 'Approved' });
    expect(res.status).toBe(404);
  });
});
