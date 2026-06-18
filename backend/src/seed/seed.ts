/**
 * Seed script: inserts realistic sample data covering all Phase-1 (P1)
 * tables plus the supporting masters they depend on, and a handful of
 * P3 alert_event rows so the Alerts screens have something to show.
 *
 * Idempotent-ish: uses fixed UUIDs (v5-style deterministic literals) so
 * re-running clears previously seeded rows by code/business-key before
 * re-inserting, rather than duplicating. Safe to run repeatedly in dev.
 *
 * Run: npm run seed (from backend/)
 */
import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool';

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Clearing previously seeded data (in FK-safe order)...');
    await client.query(`
      TRUNCATE TABLE
        alert_event, approval_request, job_card_line, job_card,
        accompaniment_issue, accompaniment_master,
        accessory_event, accessory_master,
        tyre_movement, tyre_master,
        asset_compliance, compliance_type_master,
        fuel_variance, fuel_transaction, fuel_rate_master, fuel_vendor_station,
        vehicle_trailer_coupling, vehicle_fuel_profile,
        workshop_rate_contract, workshop_master,
        item_master,
        trailer_master, vehicle_master,
        driver_master, vendor_master,
        user_master, branch_master, role_master
      CASCADE
    `);

    // ---------- Roles ----------
    console.log('Seeding role_master...');
    const roles = [
      ['ADMIN', 'Administrator', 'Full system access'],
      ['FLEET_MANAGER', 'Fleet Manager', 'Manages fleet, vehicles, trailers, compliance'],
      ['WORKSHOP_SUPERVISOR', 'Workshop Supervisor', 'Manages job cards and workshop operations'],
      ['DRIVER', 'Driver', 'Mobile/driver-facing operations'],
      ['APPROVER', 'Finance / Approver', 'Approves fuel variance, job card estimates, compliance overrides'],
    ];
    for (const [role_code, role_name, description] of roles) {
      await client.query(
        `INSERT INTO role_master (role_code, role_name, description, is_active) VALUES ($1,$2,$3,true)`,
        [role_code, role_name, description]
      );
    }

    // ---------- Branches ----------
    console.log('Seeding branch_master...');
    const branchRows = await client.query(
      `INSERT INTO branch_master (branch_code, branch_name, region, state_code, city, address, is_workshop, is_store, status)
       VALUES
        ('BR-DEL','Delhi Hub','North','DL','Delhi','Plot 12, Industrial Area, Delhi', true, true, 'Active'),
        ('BR-MUM','Mumbai Hub','West','MH','Mumbai','Plot 4, Andheri East, Mumbai', true, true, 'Active'),
        ('BR-BLR','Bangalore Hub','South','KA','Bangalore','Plot 9, Peenya, Bangalore', false, true, 'Active')
       RETURNING branch_id, branch_code`
    );
    const branchByCode: Record<string, string> = {};
    branchRows.rows.forEach((r) => (branchByCode[r.branch_code] = r.branch_id));

    // ---------- Users ----------
    console.log('Seeding user_master...');
    const pwHash = await bcrypt.hash('Password@123', 10);
    const users = [
      ['admin@fleet.test', 'Admin User', 'ADMIN', branchByCode['BR-DEL']],
      ['fleetmanager@fleet.test', 'Priya Sharma', 'FLEET_MANAGER', branchByCode['BR-DEL']],
      ['workshop@fleet.test', 'Ramesh Kumar', 'WORKSHOP_SUPERVISOR', branchByCode['BR-MUM']],
      ['driver1@fleet.test', 'Suresh Yadav', 'DRIVER', branchByCode['BR-DEL']],
      ['driver2@fleet.test', 'Mahesh Singh', 'DRIVER', branchByCode['BR-MUM']],
      ['approver@fleet.test', 'Anita Desai', 'APPROVER', branchByCode['BR-BLR']],
    ];
    const userRows = await client.query(
      `INSERT INTO user_master (login_id, display_name, mobile_no, email, role_code, branch_id, status, password_hash)
       VALUES
        ($1,$2,'9810000001',$1,$3,$4,'Active',$5),
        ($6,$7,'9810000002',$6,$8,$9,'Active',$5),
        ($10,$11,'9810000003',$10,$12,$13,'Active',$5),
        ($14,$15,'9810000004',$14,$16,$17,'Active',$5),
        ($18,$19,'9810000005',$18,$20,$21,'Active',$5),
        ($22,$23,'9810000006',$22,$24,$25,'Active',$5)
       RETURNING user_id, login_id, role_code`,
      [
        users[0][0], users[0][1], users[0][2], users[0][3], pwHash,
        users[1][0], users[1][1], users[1][2], users[1][3],
        users[2][0], users[2][1], users[2][2], users[2][3],
        users[3][0], users[3][1], users[3][2], users[3][3],
        users[4][0], users[4][1], users[4][2], users[4][3],
        users[5][0], users[5][1], users[5][2], users[5][3],
      ]
    );
    const userByLogin: Record<string, string> = {};
    userRows.rows.forEach((r) => (userByLogin[r.login_id] = r.user_id));

    // ---------- Vendors ----------
    console.log('Seeding vendor_master...');
    const vendorRows = await client.query(
      `INSERT INTO vendor_master (vendor_code, vendor_name, vendor_type, gstin, contact_person, mobile_no, email, payment_terms_days, status)
       VALUES
        ('VEN-001','Bharat Petroleum Corp','FuelSupplier','07AAACB2902M1ZP','Vikram Joshi','9820000001','vikram@bpcl.test',30,'Active'),
        ('VEN-002','MRF Tyres Distributor','TyreVendor','27AAACM1234A1ZQ','Suresh Iyer','9820000002','suresh@mrf.test',45,'Active'),
        ('VEN-003','Apex Workshop Vendor','WorkshopVendor','29AAACA5678B1ZR','Lakshmi Rao','9820000003','lakshmi@apexws.test',30,'Active'),
        ('VEN-004','TrackSafe GPS Devices','AccessoryVendor','06AAACT9012C1ZS','Rahul Mehta','9820000004','rahul@tracksafe.test',60,'Active')
       RETURNING vendor_id, vendor_code`
    );
    const vendorByCode: Record<string, string> = {};
    vendorRows.rows.forEach((r) => (vendorByCode[r.vendor_code] = r.vendor_id));

    // ---------- Drivers ----------
    console.log('Seeding driver_master...');
    const driverRows = await client.query(
      `INSERT INTO driver_master (driver_code, driver_name, mobile_no, licence_no, licence_valid_upto, hazmat_certified, home_branch_id, status)
       VALUES
        ('DRV-001','Suresh Yadav','9810000004','DL-0120150012345','2027-03-31',false,$1,'Active'),
        ('DRV-002','Mahesh Singh','9810000005','MH-0220180067890','2026-11-30',true,$2,'Active'),
        ('DRV-003','Ravi Verma','9810000007','KA-0320190054321','2025-09-15',false,$3,'Active')
       RETURNING driver_id, driver_code`,
      [branchByCode['BR-DEL'], branchByCode['BR-MUM'], branchByCode['BR-BLR']]
    );
    const driverByCode: Record<string, string> = {};
    driverRows.rows.forEach((r) => (driverByCode[r.driver_code] = r.driver_id));

    // ---------- Vehicles ----------
    console.log('Seeding vehicle_master...');
    const vehicleRows = await client.query(
      `INSERT INTO vehicle_master
        (registration_no, vehicle_code, ownership_type, vehicle_category, vehicle_type, fuel_type, make, model,
         manufacture_year, vin_no, chassis_no, engine_no, gvw_kg, payload_capacity_kg, volume_cbm,
         axle_configuration, body_type, branch_id, current_driver_id, status, odo_source, current_odometer_km)
       VALUES
        ('DL01AB1234','VEH-001','Owned','HCV','Truck','Diesel','Tata','Signa 4220',2021,'VIN1001','CHS1001','ENG1001',42000,28000,55,'6x2','Box',$1,$4,'Assigned','Manual',125000),
        ('MH02CD5678','VEH-002','Owned','MCV','Truck','CNG','Ashok Leyland','Boss 1815',2022,'VIN1002','CHS1002','ENG1002',18500,11000,32,'4x2','Flatbed',$2,$5,'Available','Manual',62000),
        ('KA03EF9012','VEH-003','Leased','LCV','Mini Truck','Diesel','Mahindra','Furio 7',2023,'VIN1003','CHS1003','ENG1003',7500,3500,18,'2x2','Box',$3,$6,'Available','GPS',15000),
        ('DL04GH3456','VEH-004','Owned','HCV','Trailer Truck','EV','Tata','Prima E.55S',2023,'VIN1004','CHS1004','ENG1004',55000,32000,60,'6x4','Flatbed',$1,NULL,'UnderMaintenance','GPS',8000),
        ('MH05IJ7890','VEH-005','Attached','MCV','Truck','LNG','BharatBenz','1217C',2020,'VIN1005','CHS1005','ENG1005',17000,10500,30,'4x2','Box',$2,NULL,'ComplianceHold','Manual',180000)
       RETURNING vehicle_id, registration_no`,
      [branchByCode['BR-DEL'], branchByCode['BR-MUM'], branchByCode['BR-BLR'],
       driverByCode['DRV-001'], driverByCode['DRV-002'], driverByCode['DRV-003']]
    );
    const vehicleByReg: Record<string, string> = {};
    vehicleRows.rows.forEach((r) => (vehicleByReg[r.registration_no] = r.vehicle_id));

    // ---------- Vehicle fuel profiles ----------
    console.log('Seeding vehicle_fuel_profile...');
    await client.query(
      `INSERT INTO vehicle_fuel_profile (vehicle_id, fuel_type, diesel_tank_capacity_ltr, expected_mileage, range_km)
       VALUES
        ($1::uuid,'Diesel',300,4.2,1260),
        ($2::uuid,'Diesel',120,8.5,1020)`,
      [vehicleByReg['DL01AB1234'], vehicleByReg['KA03EF9012']]
    );
    await client.query(
      `INSERT INTO vehicle_fuel_profile (vehicle_id, fuel_type, cng_cylinder_capacity_kg, cng_hydrotest_valid_upto, expected_mileage, range_km)
       VALUES ($1::uuid,'CNG',90,'2026-12-31'::date,5.5,400)`,
      [vehicleByReg['MH02CD5678']]
    );
    await client.query(
      `INSERT INTO vehicle_fuel_profile (vehicle_id, fuel_type, battery_capacity_kwh, charger_connector_type, battery_warranty_upto, range_km)
       VALUES ($1::uuid,'EV',250,'CCS2','2028-06-30'::date,300)`,
      [vehicleByReg['DL04GH3456']]
    );
    await client.query(
      `INSERT INTO vehicle_fuel_profile (vehicle_id, fuel_type, lng_tank_capacity_kg, lng_tank_inspection_valid_upto, expected_mileage, range_km)
       VALUES ($1::uuid,'LNG',180,'2026-06-30'::date,6.0,900)`,
      [vehicleByReg['MH05IJ7890']]
    );

    // ---------- Trailers ----------
    console.log('Seeding trailer_master...');
    const trailerRows = await client.query(
      `INSERT INTO trailer_master (trailer_no, trailer_type, body_type, chassis_no, payload_capacity_kg, volume_cbm, length_ft, axle_count, branch_id, status)
       VALUES
        ('TRL-DL-01','Flatbed','Flatbed','TCHS001',25000,0,40,3,$1,'Available'),
        ('TRL-MH-01','Container','Box','TCHS002',28000,65,40,3,$2,'Attached'),
        ('TRL-KA-01','Tanker','Tanker','TCHS003',20000,30,32,2,$3,'Available')
       RETURNING trailer_id, trailer_no`,
      [branchByCode['BR-DEL'], branchByCode['BR-MUM'], branchByCode['BR-BLR']]
    );
    const trailerByNo: Record<string, string> = {};
    trailerRows.rows.forEach((r) => (trailerByNo[r.trailer_no] = r.trailer_id));

    // ---------- Couplings ----------
    console.log('Seeding vehicle_trailer_coupling...');
    await client.query(
      `INSERT INTO vehicle_trailer_coupling (vehicle_id, trailer_id, coupled_at, coupling_location, odometer_km, coupled_by_user_id, status)
       VALUES
        ($1,$2,now() - interval '5 days','Delhi Yard',124500,$5,'Coupled'),
        ($3,$4,now() - interval '10 days','Mumbai Yard',61000,$5,'Coupled')`,
      [vehicleByReg['DL01AB1234'], trailerByNo['TRL-DL-01'],
       vehicleByReg['MH02CD5678'], trailerByNo['TRL-MH-01'],
       userByLogin['fleetmanager@fleet.test']]
    );

    // ---------- Fuel vendor stations + rates ----------
    console.log('Seeding fuel_vendor_station, fuel_rate_master...');
    const stationRows = await client.query(
      `INSERT INTO fuel_vendor_station (vendor_id, station_name, fuel_types_supported, address, is_approved, status)
       VALUES
        ($1,'BPCL Delhi Ring Road','Diesel,CNG','Ring Road, Delhi',true,'Active'),
        ($1,'BPCL Mumbai Highway','Diesel,LNG','Highway, Mumbai',true,'Active')
       RETURNING station_id, station_name`,
      [vendorByCode['VEN-001']]
    );
    const stationByName: Record<string, string> = {};
    stationRows.rows.forEach((r) => (stationByName[r.station_name] = r.station_id));

    await client.query(
      `INSERT INTO fuel_rate_master (station_id, fuel_type, unit_of_measure, rate_per_unit, effective_from, status)
       VALUES
        ($1,'Diesel','Litre',92.50,'2026-01-01','Active'),
        ($1,'CNG','Kg',78.20,'2026-01-01','Active'),
        ($2,'LNG','Kg',85.00,'2026-01-01','Active')`,
      [stationByName['BPCL Delhi Ring Road'], stationByName['BPCL Mumbai Highway']]
    );

    // ---------- Fuel transactions ----------
    console.log('Seeding fuel_transaction...');
    await client.query(
      `INSERT INTO fuel_transaction
        (vehicle_id, driver_id, station_id, fuel_type, txn_datetime, quantity, unit_of_measure, rate_per_unit, amount, odometer_km, receipt_no, status)
       VALUES
        ($1,$4,$6,'Diesel', now() - interval '2 days', 250.5, 'Litre', 92.5, 23171.25, 124800, 'RCPT-1001', 'Recorded'),
        ($2,$5,$6,'CNG', now() - interval '1 days', 60.0, 'Kg', 78.2, 4692.00, 61500, 'RCPT-1002', 'Recorded'),
        ($3,NULL,$7,'Diesel', now() - interval '3 days', 80.0, 'Litre', 92.5, 7400.00, 14800, 'RCPT-1003', 'Recorded')`,
      [vehicleByReg['DL01AB1234'], vehicleByReg['MH02CD5678'], vehicleByReg['KA03EF9012'],
       driverByCode['DRV-001'], driverByCode['DRV-002'],
       stationByName['BPCL Delhi Ring Road'], stationByName['BPCL Mumbai Highway']]
    );

    // ---------- Compliance types + asset compliance ----------
    console.log('Seeding compliance_type_master, asset_compliance...');
    await client.query(
      `INSERT INTO compliance_type_master (compliance_type_code, compliance_name, asset_type, is_critical, default_alert_days, status)
       VALUES
        ('INSURANCE','Insurance','Vehicle',true,'30','Active'),
        ('FITNESS','Fitness Certificate','Vehicle',true,'30','Active'),
        ('PERMIT','Permit','Vehicle',true,'30','Active'),
        ('PUC','Pollution Under Control','Vehicle',false,'15','Active'),
        ('ROAD_TAX','Road Tax','Vehicle',true,'30','Active'),
        ('TRAILER_FITNESS','Trailer Fitness Certificate','Trailer',true,'30','Active')`
    );

    await client.query(
      `INSERT INTO asset_compliance (asset_type, asset_id, compliance_type_code, document_no, issued_by, valid_from, valid_upto, amount, status)
       VALUES
        ('Vehicle',$1::uuid,'INSURANCE','INS-DL01AB1234','ICICI Lombard','2025-07-01','2026-06-30',45000,'Valid'),
        ('Vehicle',$1::uuid,'FITNESS','FIT-DL01AB1234','RTO Delhi','2024-01-01','2026-06-25',2500,'ExpiringSoon'),
        ('Vehicle',$2::uuid,'PERMIT','PER-MH02CD5678','RTO Mumbai','2024-01-01','2026-07-10',8000,'Valid'),
        ('Vehicle',$3::uuid,'PUC','PUC-MH05IJ7890','PUC Center','2025-06-01','2026-05-30',500,'Expired'),
        ('Trailer',$4::uuid,'TRAILER_FITNESS','TFIT-TRLDL01','RTO Delhi','2024-01-01','2026-08-01',1500,'Valid')`,
      [vehicleByReg['DL01AB1234'], vehicleByReg['MH02CD5678'], vehicleByReg['MH05IJ7890'], trailerByNo['TRL-DL-01']]
    );

    // ---------- Workshops + rate contracts ----------
    console.log('Seeding workshop_master, workshop_rate_contract...');
    const workshopRows = await client.query(
      `INSERT INTO workshop_master (workshop_code, workshop_name, workshop_type, vendor_id, branch_id, gstin, service_categories, payment_terms_days, status)
       VALUES
        ('WS-001','Apex Truck Care Delhi','External',$1::uuid,$2::uuid,'07AAACA5678B1ZR','Engine,Brakes,Electrical',30,'Active'),
        ('WS-002','In-house Mumbai Workshop','Internal',NULL,$3::uuid,NULL,'General Service,Tyres',0,'Active')
       RETURNING workshop_id, workshop_code`,
      [vendorByCode['VEN-003'], branchByCode['BR-DEL'], branchByCode['BR-MUM']]
    );
    const workshopByCode: Record<string, string> = {};
    workshopRows.rows.forEach((r) => (workshopByCode[r.workshop_code] = r.workshop_id));

    await client.query(
      `INSERT INTO workshop_rate_contract (workshop_id, service_code, service_description, vehicle_type, rate, effective_from, status)
       VALUES
        ($1,'SVC-ENGINE','Engine overhaul labour','Truck',8500,'2026-01-01','Active'),
        ($2,'SVC-GENERAL','General service labour','Truck',2500,'2026-01-01','Active')`,
      [workshopByCode['WS-001'], workshopByCode['WS-002']]
    );

    // ---------- Job cards + lines ----------
    console.log('Seeding job_card, job_card_line...');
    const jobCardRows = await client.query(
      `INSERT INTO job_card
        (job_card_no, job_card_type, vehicle_id, branch_id, workshop_id, reported_by_user_id, reported_datetime,
         odometer_km, defect_summary, priority, estimated_amount, status, opened_at)
       VALUES
        ('JC-2026-0001','Scheduled',$1,$3,$5,$6, now() - interval '4 days', 124000, 'Routine PM service due', 'Medium', 12000, 'Open', now() - interval '4 days'),
        ('JC-2026-0002','Breakdown',$2,$4,$7,$6, now() - interval '1 days', 61200, 'Engine overheating on highway', 'High', 25000, 'Diagnosis', now() - interval '1 days')
       RETURNING job_card_id, job_card_no`,
      [vehicleByReg['DL01AB1234'], vehicleByReg['MH02CD5678'],
       branchByCode['BR-DEL'], branchByCode['BR-MUM'],
       workshopByCode['WS-001'], userByLogin['workshop@fleet.test'], workshopByCode['WS-002']]
    );
    const jobCardByNo: Record<string, string> = {};
    jobCardRows.rows.forEach((r) => (jobCardByNo[r.job_card_no] = r.job_card_id));

    await client.query(
      `INSERT INTO job_card_line (job_card_id, line_type, description, quantity, unit_rate, amount, approval_status)
       VALUES
        ($1,'Labour','PM Service labour',1,2500,2500,'Pending'),
        ($1,'Part','Oil filter',2,450,900,'Pending'),
        ($2,'Labour','Engine diagnosis labour',1,1500,1500,'Pending')`,
      [jobCardByNo['JC-2026-0001'], jobCardByNo['JC-2026-0002']]
    );

    // ---------- Tyres ----------
    console.log('Seeding tyre_master...');
    await client.query(
      `INSERT INTO tyre_master
        (tyre_serial_no, brand, model, size, ply_rating, purchase_date, vendor_id, purchase_cost, warranty_upto,
         current_branch_id, current_vehicle_id, current_position, status, total_run_km)
       VALUES
        ('MRF-TY-1001','MRF','Steelmile','295/95 R22.5','16PR','2025-01-15',$1,18500,'2028-01-15',$2,$3,'FrontLeft','Fitted',45000),
        ('MRF-TY-1002','MRF','Steelmile','295/95 R22.5','16PR','2025-01-15',$1,18500,'2028-01-15',$2,$3,'FrontRight','Fitted',45000),
        ('CEAT-TY-2001','CEAT','Mile XL','215/75 R17.5','14PR','2025-06-01',$1,9800,'2027-06-01',$4,NULL,NULL,'InStock',0)`,
      [vendorByCode['VEN-002'], branchByCode['BR-DEL'], vehicleByReg['DL01AB1234'], branchByCode['BR-MUM']]
    );

    // ---------- Accessories ----------
    console.log('Seeding accessory_master...');
    await client.query(
      `INSERT INTO accessory_master
        (accessory_code, accessory_type, serial_no, vendor_id, purchase_date, warranty_upto, sim_no, imei_no,
         current_vehicle_id, health_status, status)
       VALUES
        ('ACC-GPS-001','GPS/AIS140','GPS-SN-1001',$1,'2025-02-01','2027-02-01','9810099001','IMEI100100100100',$2,'Healthy','Installed'),
        ('ACC-CAM-001','Camera','CAM-SN-2001',$1,'2025-02-01','2027-02-01',NULL,NULL,$2,'Healthy','Installed'),
        ('ACC-OBD-001','OBD/CAN','OBD-SN-3001',$1,'2025-03-01','2027-03-01',NULL,NULL,$3,'Faulty','Installed')`,
      [vendorByCode['VEN-004'], vehicleByReg['DL01AB1234'], vehicleByReg['MH05IJ7890']]
    );

    // ---------- Accompaniments ----------
    console.log('Seeding accompaniment_master...');
    await client.query(
      `INSERT INTO accompaniment_master (accompaniment_code, accompaniment_type, size_or_spec, is_reusable, current_branch_id, current_status, vendor_id)
       VALUES
        ('ACM-TARP-001','Tarpaulin','40ft HD',true,$1,'Available',$2),
        ('ACM-SEAL-001','Seal','Standard',false,$1,'Available',$2),
        ('ACM-OTP-001','OTPLock','Digital',true,$3,'Issued',$2)`,
      [branchByCode['BR-DEL'], vendorByCode['VEN-002'], branchByCode['BR-MUM']]
    );

    // ---------- Item master (supports job_card_line parts catalog) ----------
    console.log('Seeding item_master...');
    await client.query(
      `INSERT INTO item_master (item_code, item_name, item_category, uom, is_serialized, is_reusable, standard_cost, status)
       VALUES
        ('ITM-OIL-001','Engine Oil Filter','Consumable','Each',false,false,450,'Active'),
        ('ITM-BRK-001','Brake Pad Set','Spare Part','Set',false,false,2200,'Active')`
    );

    // ---------- Approval requests ----------
    console.log('Seeding approval_request...');
    await client.query(
      `INSERT INTO approval_request (transaction_type, transaction_id, requested_by_user_id, requested_at, approval_level, approval_status)
       VALUES
        ('job_card',$1,$2, now() - interval '4 days', 1, 'Pending'),
        ('job_card',$3,$2, now() - interval '1 days', 1, 'Pending')`,
      [jobCardByNo['JC-2026-0001'], userByLogin['workshop@fleet.test'], jobCardByNo['JC-2026-0002']]
    );

    // ---------- Alert events ----------
    console.log('Seeding alert_event...');
    await client.query(
      `INSERT INTO alert_event (alert_type, severity, entity_type, entity_id, alert_title, alert_message, assigned_to_user_id, status)
       VALUES
        ('ComplianceExpiry','Warning','Vehicle',$1,'Fitness certificate expiring soon','Vehicle DL01AB1234 fitness certificate expires 2026-06-25',$3,'Open'),
        ('ComplianceExpiry','Critical','Vehicle',$2,'PUC expired','Vehicle MH05IJ7890 PUC has expired',$3,'Open'),
        ('MaintenanceDue','Warning','Vehicle',$1,'Maintenance due','Vehicle DL01AB1234 has crossed maintenance KM threshold',$3,'Open')`,
      [vehicleByReg['DL01AB1234'], vehicleByReg['MH05IJ7890'], userByLogin['fleetmanager@fleet.test']]
    );

    // ========================================================================
    // Phase 2 / Phase 3 sample data
    // ========================================================================

    console.log('Seeding maintenance_schedule...');
    await client.query(
      `INSERT INTO maintenance_schedule (schedule_code, vehicle_category, vehicle_type, fuel_type, maintenance_type, trigger_km, trigger_days, is_blocking, status)
       VALUES
        ('MS-10K-SERVICE','HCV','Rigid','Diesel','Scheduled',10000,90,false,'Active'),
        ('MS-PUC-CHECK','LCV','Rigid','Diesel','Scheduled',NULL,180,true,'Active')`
    );

    console.log('Seeding maintenance_due...');
    await client.query(
      `INSERT INTO maintenance_due (vehicle_id, maintenance_schedule_id, due_date, due_odometer_km, current_odometer_km, status)
       SELECT v.vehicle_id, ms.maintenance_schedule_id, CURRENT_DATE + interval '15 days', 50000, 48500, 'Due'
       FROM vehicle_master v, maintenance_schedule ms
       WHERE v.registration_no = 'DL01AB1234' AND ms.schedule_code = 'MS-10K-SERVICE'`
    );

    console.log('Seeding breakdown_event...');
    await client.query(
      `INSERT INTO breakdown_event (vehicle_id, breakdown_datetime, location_text, breakdown_category, severity, downtime_minutes, root_cause, status)
       SELECT vehicle_id, now() - interval '2 days', 'NH-48, near Gurugram', 'Mechanical', 'Major', 240, 'Clutch plate failure', 'Resolved'
       FROM vehicle_master WHERE registration_no = 'MH05IJ7890'`
    );

    console.log('Seeding accident_event...');
    await client.query(
      `INSERT INTO accident_event (vehicle_id, driver_id, accident_datetime, location_text, third_party_involved, fir_no, damage_summary, claim_status, status)
       SELECT v.vehicle_id, d.driver_id, now() - interval '10 days', 'Outer Ring Road, Bengaluru', true, 'FIR-2026-00231', 'Front bumper and headlamp damage', 'Filed', 'UnderReview'
       FROM vehicle_master v, driver_master d
       WHERE v.registration_no = 'DL01AB1234' AND d.driver_code = (SELECT driver_code FROM driver_master LIMIT 1)`
    );

    console.log('Seeding payable_validation...');
    await client.query(
      `INSERT INTO payable_validation (invoice_id, validation_type, validation_status, expected_value, actual_value, variance_amount, remarks)
       SELECT invoice_id, 'RateContractCheck', 'Variance', '5000.00', '5400.00', 400.00, 'Labour rate exceeds contracted rate'
       FROM vendor_invoice LIMIT 1`
    );

    console.log('Seeding stock_ledger...');
    await client.query(
      `INSERT INTO stock_ledger (txn_datetime, branch_id, item_id, movement_type, quantity, unit_cost, reference_type, status)
       SELECT now() - interval '3 days', b.branch_id, i.item_id, 'Receipt', 20, 450, 'PurchaseOrder', 'Posted'
       FROM branch_master b, item_master i WHERE b.branch_code = 'BR-DEL' AND i.item_code = 'ITM-OIL-001'
       UNION ALL
       SELECT now() - interval '1 days', b.branch_id, i.item_id, 'Issue', 4, 450, 'JobCard', 'Posted'
       FROM branch_master b, item_master i WHERE b.branch_code = 'BR-DEL' AND i.item_code = 'ITM-OIL-001'`
    );

    console.log('Seeding inspection_template...');
    await client.query(
      `INSERT INTO inspection_template (template_code, template_name, asset_type, fuel_type, inspection_type, status)
       VALUES
        ('INS-PDI-001','Pre-Delivery Inspection - HCV','Vehicle','Diesel','PDI','Active'),
        ('INS-PRETRIP-001','Pre-Trip Safety Check','Vehicle',NULL,'PreTrip','Active')`
    );

    console.log('Seeding inspection_event...');
    await client.query(
      `INSERT INTO inspection_event (template_id, asset_type, asset_id, vehicle_id, performed_by_user_id, inspection_datetime, outcome, remarks)
       SELECT t.template_id, 'Vehicle', v.vehicle_id, v.vehicle_id, u.user_id, now() - interval '1 days', 'Pass', 'All checks within tolerance'
       FROM inspection_template t, vehicle_master v, user_master u
       WHERE t.template_code = 'INS-PRETRIP-001' AND v.registration_no = 'DL01AB1234' AND u.login_id = 'workshop@fleet.test'`
    );

    console.log('Seeding inspection_result_line...');
    await client.query(
      `INSERT INTO inspection_result_line (inspection_id, check_item_code, check_item_name, result, severity)
       SELECT inspection_id, 'TYRE-PRESSURE', 'Tyre pressure within range', 'Pass', 'Low' FROM inspection_event LIMIT 1`
    );

    console.log('Seeding trip_master...');
    await client.query(
      `INSERT INTO trip_master (trip_no, vehicle_id, driver_id, origin, destination, route_code, customer_name, cargo_type, planned_start_at, status)
       SELECT 'TRIP-2026-0001', v.vehicle_id, d.driver_id, 'Delhi', 'Mumbai', 'RT-DEL-MUM', 'Acme Logistics Pvt Ltd', 'General Cargo', now() + interval '1 days', 'Planned'
       FROM vehicle_master v, driver_master d
       WHERE v.registration_no = 'DL01AB1234' AND d.driver_code = (SELECT driver_code FROM driver_master LIMIT 1)`
    );

    console.log('Seeding toll_transaction...');
    await client.query(
      `INSERT INTO toll_transaction (vehicle_id, toll_plaza_code, toll_plaza_name, txn_datetime, amount, source, reconciliation_status)
       SELECT vehicle_id, 'TP-NH48-12', 'Kherki Daula Toll Plaza', now() - interval '6 hours', 285.00, 'FASTag', 'Matched'
       FROM vehicle_master WHERE registration_no = 'DL01AB1234'`
    );

    console.log('Seeding route_fuel_norm...');
    await client.query(
      `INSERT INTO route_fuel_norm (route_code, origin, destination, vehicle_type, fuel_type, planned_quantity, planned_toll_amount, distance_km, effective_from, status)
       VALUES ('RT-DEL-MUM','Delhi','Mumbai','Rigid','Diesel',320.5,2450.00,1420.0,CURRENT_DATE,'Active')`
    );

    console.log('Seeding compliance_alert...');
    await client.query(
      `INSERT INTO compliance_alert (asset_compliance_id, alert_date, days_to_expiry, severity, status, assigned_to_user_id)
       SELECT ac.asset_compliance_id, CURRENT_DATE, 7, 'Warning', 'Open', u.user_id
       FROM asset_compliance ac, user_master u
       WHERE u.login_id = 'fleetmanager@fleet.test' LIMIT 1`
    );

    console.log('Seeding approval_matrix...');
    await client.query(
      `INSERT INTO approval_matrix (transaction_type, amount_from, amount_to, approval_level, role_code, is_active)
       VALUES
        ('vendor_invoice', 0, 50000, 1, 'FLEET_MANAGER', true),
        ('vendor_invoice', 50000, 99999999, 2, 'ADMIN', true)`
    );

    console.log('Seeding integration_config...');
    await client.query(
      `INSERT INTO integration_config (integration_name, environment, base_url, auth_type, is_enabled)
       VALUES
        ('ULIP','Sandbox','https://mock.ulip.example/api','APIKey',true),
        ('VAHAN','Sandbox','https://mock.vahan.example/api','APIKey',true),
        ('SARATHI','Sandbox','https://mock.sarathi.example/api','APIKey',true),
        ('FASTag','Sandbox','https://mock.fastag.example/api','OAuth2',true)`
    );

    console.log('Seeding ulip_api_log...');
    await client.query(
      `INSERT INTO ulip_api_log (api_name, reference_type, http_status_code, api_status)
       VALUES
        ('VAHAN.fetchRcDetails','Vehicle',200,'Success'),
        ('FASTag.fetchTollHistory','Vehicle',200,'Success')`
    );

    console.log('Seeding alert_rule...');
    await client.query(
      `INSERT INTO alert_rule (alert_type, entity_type, threshold_value, threshold_unit, severity, notify_role_code, is_active)
       VALUES
        ('ComplianceExpiry','AssetCompliance',15,'Days','Warning','FLEET_MANAGER',true),
        ('MaintenanceDue','Vehicle',500,'KM','Warning','WORKSHOP_SUPERVISOR',true),
        ('FuelVariance','FuelTransaction',10,'Percent','Critical','FLEET_MANAGER',true)`
    );

    console.log('Seeding document_store...');
    await client.query(
      `INSERT INTO document_store (entity_type, entity_id, document_category, file_name, file_url, mime_type, uploaded_by_user_id, uploaded_at)
       SELECT 'Vehicle', v.vehicle_id, 'RC', 'RC_DL01AB1234.pdf', 'https://mock.docs.example/rc/DL01AB1234.pdf', 'application/pdf', u.user_id, now()
       FROM vehicle_master v, user_master u
       WHERE v.registration_no = 'DL01AB1234' AND u.login_id = 'admin@fleet.test'`
    );

    await client.query('COMMIT');
    console.log('Seed completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed, rolled back:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
