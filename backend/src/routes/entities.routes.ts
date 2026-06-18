import { Router } from 'express';
import { buildCrudRouter } from '../utils/crudFactory';
import { ROLES } from '../constants/roles';
import {
  vehicleSchema, trailerSchema, couplingSchema, fuelTransactionSchema,
  assetComplianceSchema, jobCardSchema, workshopSchema, tyreSchema,
  accessorySchema, accompanimentSchema,
} from '../validation/schemas';

const router = Router();

/**
 * @openapi
 * /api/vehicles:
 *   get:
 *     summary: List vehicles (paginated, filterable, searchable)
 *     tags: [Vehicle Master]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated vehicle list }
 *   post:
 *     summary: Create a vehicle
 *     tags: [Vehicle Master]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Vehicle created }
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get a vehicle by id
 *     tags: [Vehicle Master]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Vehicle detail }
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicle Master]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Vehicle updated }
 *   delete:
 *     summary: Soft-delete a vehicle
 *     tags: [Vehicle Master]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Vehicle deleted }
 */
router.use(
  '/vehicles',
  buildCrudRouter({
    table: 'vehicle_master',
    pk: 'vehicle_id',
    searchColumns: ['registration_no', 'vehicle_code', 'make', 'model'],
    createSchema: vehicleSchema,
    updateSchema: vehicleSchema,
    writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  })
);

/**
 * @openapi
 * /api/trailers:
 *   get:
 *     summary: List trailers
 *     tags: [Trailer]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated trailer list }
 * /api/trailers/{id}:
 *   get:
 *     summary: Get a trailer by id
 *     tags: [Trailer]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Trailer detail }
 */
router.use(
  '/trailers',
  buildCrudRouter({
    table: 'trailer_master',
    pk: 'trailer_id',
    searchColumns: ['trailer_no', 'trailer_type'],
    createSchema: trailerSchema,
    updateSchema: trailerSchema,
    writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  })
);

/**
 * @openapi
 * /api/couplings:
 *   get:
 *     summary: List vehicle-trailer couplings
 *     tags: [Coupling]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated coupling list }
 */
router.use(
  '/couplings',
  buildCrudRouter({
    table: 'vehicle_trailer_coupling',
    pk: 'coupling_id',
    createSchema: couplingSchema,
    updateSchema: couplingSchema,
    writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR],
  })
);

/**
 * @openapi
 * /api/fuel-transactions:
 *   get:
 *     summary: List fuel transactions
 *     tags: [Fuel & Energy]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated fuel transaction list }
 */
router.use(
  '/fuel-transactions',
  buildCrudRouter({
    table: 'fuel_transaction',
    pk: 'fuel_txn_id',
    searchColumns: ['receipt_no'],
    createSchema: fuelTransactionSchema,
    updateSchema: fuelTransactionSchema,
    writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER],
  })
);

/**
 * @openapi
 * /api/compliance:
 *   get:
 *     summary: List asset compliance records
 *     tags: [Compliance]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated compliance list }
 */
router.use(
  '/compliance',
  buildCrudRouter({
    table: 'asset_compliance',
    pk: 'asset_compliance_id',
    searchColumns: ['document_no'],
    createSchema: assetComplianceSchema,
    updateSchema: assetComplianceSchema,
    writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  })
);

/**
 * @openapi
 * /api/job-cards:
 *   get:
 *     summary: List job cards
 *     tags: [Job Card]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated job card list }
 */
router.use(
  '/job-cards',
  buildCrudRouter({
    table: 'job_card',
    pk: 'job_card_id',
    searchColumns: ['job_card_no', 'defect_summary'],
    createSchema: jobCardSchema,
    updateSchema: jobCardSchema,
    writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR],
  })
);

/**
 * @openapi
 * /api/workshops:
 *   get:
 *     summary: List workshops
 *     tags: [Workshop]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated workshop list }
 */
router.use(
  '/workshops',
  buildCrudRouter({
    table: 'workshop_master',
    pk: 'workshop_id',
    searchColumns: ['workshop_code', 'workshop_name'],
    createSchema: workshopSchema,
    updateSchema: workshopSchema,
    writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  })
);

/**
 * @openapi
 * /api/tyres:
 *   get:
 *     summary: List tyres
 *     tags: [Tyre]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated tyre list }
 */
router.use(
  '/tyres',
  buildCrudRouter({
    table: 'tyre_master',
    pk: 'tyre_id',
    searchColumns: ['tyre_serial_no', 'brand', 'model'],
    createSchema: tyreSchema,
    updateSchema: tyreSchema,
    writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR],
  })
);

/**
 * @openapi
 * /api/accessories:
 *   get:
 *     summary: List accessories
 *     tags: [Accessory]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated accessory list }
 */
router.use(
  '/accessories',
  buildCrudRouter({
    table: 'accessory_master',
    pk: 'accessory_id',
    searchColumns: ['accessory_code', 'serial_no'],
    createSchema: accessorySchema,
    updateSchema: accessorySchema,
    writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR],
  })
);

/**
 * @openapi
 * /api/accompaniments:
 *   get:
 *     summary: List accompaniments (tarpaulins, seals, OTP locks, safety kits)
 *     tags: [Accompaniment]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated accompaniment list }
 */
router.use(
  '/accompaniments',
  buildCrudRouter({
    table: 'accompaniment_master',
    pk: 'accompaniment_id',
    searchColumns: ['accompaniment_code'],
    createSchema: accompanimentSchema,
    updateSchema: accompanimentSchema,
    writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  })
);

// ---- Supporting masters needed by P1 screens (no custom validation; generic CRUD) ----

/**
 * @openapi
 * /api/branches:
 *   get:
 *     summary: List branches
 *     tags: [Masters]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated branch list }
 */
router.use('/branches', buildCrudRouter({ table: 'branch_master', pk: 'branch_id', searchColumns: ['branch_code', 'branch_name'], writeRoles: [ROLES.ADMIN] }));

/**
 * @openapi
 * /api/vendors:
 *   get:
 *     summary: List vendors
 *     tags: [Masters]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated vendor list }
 */
router.use('/vendors', buildCrudRouter({ table: 'vendor_master', pk: 'vendor_id', searchColumns: ['vendor_code', 'vendor_name'], writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] }));

/**
 * @openapi
 * /api/drivers:
 *   get:
 *     summary: List drivers
 *     tags: [Masters]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated driver list }
 */
router.use('/drivers', buildCrudRouter({ table: 'driver_master', pk: 'driver_id', searchColumns: ['driver_code', 'driver_name', 'licence_no'], writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] }));

/**
 * @openapi
 * /api/vehicle-fuel-profiles:
 *   get:
 *     summary: List vehicle fuel profiles
 *     tags: [Vehicle Master]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated fuel profile list }
 */
router.use('/vehicle-fuel-profiles', buildCrudRouter({ table: 'vehicle_fuel_profile', pk: 'fuel_profile_id', writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] }));

/**
 * @openapi
 * /api/fuel-stations:
 *   get:
 *     summary: List fuel vendor stations
 *     tags: [Fuel & Energy]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated fuel station list }
 */
router.use('/fuel-stations', buildCrudRouter({ table: 'fuel_vendor_station', pk: 'station_id', searchColumns: ['station_name'], writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] }));

/**
 * @openapi
 * /api/fuel-rates:
 *   get:
 *     summary: List fuel rates
 *     tags: [Fuel & Energy]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated fuel rate list }
 */
router.use('/fuel-rates', buildCrudRouter({ table: 'fuel_rate_master', pk: 'fuel_rate_id', writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] }));

/**
 * @openapi
 * /api/compliance-types:
 *   get:
 *     summary: List compliance type masters
 *     tags: [Compliance]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated compliance type list }
 */
router.use('/compliance-types', buildCrudRouter({ table: 'compliance_type_master', pk: 'compliance_type_code', writeRoles: [ROLES.ADMIN] }));

/**
 * @openapi
 * /api/job-card-lines:
 *   get:
 *     summary: List job card lines (parts/tyre/accessory/consumable requests within a job card)
 *     tags: [Job Card]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated job card line list }
 */
router.use('/job-card-lines', buildCrudRouter({ table: 'job_card_line', pk: 'job_card_line_id', writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR] }));

/**
 * @openapi
 * /api/workshop-rate-contracts:
 *   get:
 *     summary: List workshop rate contracts
 *     tags: [Workshop]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated rate contract list }
 */
router.use('/workshop-rate-contracts', buildCrudRouter({ table: 'workshop_rate_contract', pk: 'rate_contract_id', writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] }));

/**
 * @openapi
 * /api/items:
 *   get:
 *     summary: List item master (parts/consumables/accompaniment item catalog)
 *     tags: [Masters]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated item list }
 */
router.use('/items', buildCrudRouter({ table: 'item_master', pk: 'item_id', searchColumns: ['item_code', 'item_name'], writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] }));

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: List roles
 *     tags: [Masters]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Role list }
 */
router.use('/roles', buildCrudRouter({ table: 'role_master', pk: 'role_code', writeRoles: [ROLES.ADMIN] }));

// ---- Additional P1 tables required by frontend screens (generic CRUD, no custom validation) ----

/**
 * @openapi
 * /api/vehicle-cost-ledger:
 *   get:
 *     summary: List vehicle cost ledger entries (used for cost reports and dashboard summaries)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated cost ledger list }
 */
router.use(
  '/vehicle-cost-ledger',
  buildCrudRouter({ table: 'vehicle_cost_ledger', pk: 'cost_ledger_id', writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] })
);

/**
 * @openapi
 * /api/tyre-movements:
 *   get:
 *     summary: List tyre movement events (fitment/removal history)
 *     tags: [Tyre]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated tyre movement list }
 */
router.use(
  '/tyre-movements',
  buildCrudRouter({ table: 'tyre_movement', pk: 'tyre_movement_id', writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR] })
);

/**
 * @openapi
 * /api/accessory-events:
 *   get:
 *     summary: List accessory events (install/remove/fault history)
 *     tags: [Accessory]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated accessory event list }
 */
router.use(
  '/accessory-events',
  buildCrudRouter({ table: 'accessory_event', pk: 'accessory_event_id', writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR] })
);

/**
 * @openapi
 * /api/accompaniment-issues:
 *   get:
 *     summary: List accompaniment issue/return records
 *     tags: [Accompaniment]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated accompaniment issue list }
 */
router.use(
  '/accompaniment-issues',
  buildCrudRouter({ table: 'accompaniment_issue', pk: 'accompaniment_issue_id', writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR] })
);

/**
 * @openapi
 * /api/vendor-invoices:
 *   get:
 *     summary: List vendor invoices (workshop/fuel/tyre/accessory/consumable/compliance)
 *     tags: [Workshop]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated vendor invoice list }
 */
router.use(
  '/vendor-invoices',
  buildCrudRouter({ table: 'vendor_invoice', pk: 'invoice_id', searchColumns: ['invoice_no'], writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR] })
);

/**
 * @openapi
 * /api/fuel-variances:
 *   get:
 *     summary: List fuel variance records (planned vs actual fuel quantity)
 *     tags: [Fuel & Energy]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated fuel variance list }
 */
router.use(
  '/fuel-variances',
  buildCrudRouter({ table: 'fuel_variance', pk: 'fuel_variance_id', writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.APPROVER] })
);

/**
 * @openapi
 * /api/invoice-lines:
 *   get:
 *     summary: List vendor invoice line items
 *     tags: [Workshop]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated invoice line list }
 */
router.use(
  '/invoice-lines',
  buildCrudRouter({ table: 'invoice_line', pk: 'invoice_line_id', writeRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR] })
);

export default router;
