import { createResource } from './resource';
import type {
  Branch, Vendor, Driver, Vehicle, Trailer, Coupling, FuelTransaction,
  AssetCompliance, ComplianceType, JobCard, JobCardLine, Workshop, VendorInvoice,
  Tyre, TyreMovement, Accessory, AccessoryEvent, Accompaniment, AccompanimentIssue,
  ApprovalRequest, AlertEvent, VehicleCostLedger, ItemMaster, Battery, Challan,
  EpicStatusUpload, NonWorkingVehicleAction,
} from '../types/entities';
import type { FuelVariance } from '../types/entities-extra';
import type {
  InspectionTemplate, RouteFuelNorm, ComplianceAlertRecord, TripMaster, TollTransaction,
  ApprovalMatrix, MaintenanceSchedule, MaintenanceDue, BreakdownEvent, AccidentEvent,
  PayableValidation, StockLedger, InspectionEvent, InspectionResultLine, IntegrationConfig,
  UlipApiLog, AlertRule, DocumentStore, UserRecord, HandoverDocument,
} from '../types/entities-p2p3';

export const branchApi = createResource<Branch>('/branches');
export const vendorApi = createResource<Vendor>('/vendors');
export const driverApi = createResource<Driver>('/drivers');
export const vehicleApi = createResource<Vehicle>('/vehicles');
export const trailerApi = createResource<Trailer>('/trailers');
export const couplingApi = createResource<Coupling>('/couplings');
export const fuelTransactionApi = createResource<FuelTransaction>('/fuel-transactions');
export const complianceApi = createResource<AssetCompliance>('/compliance');
export const complianceTypeApi = createResource<ComplianceType>('/compliance-types');
export const jobCardApi = createResource<JobCard>('/job-cards');
export const jobCardLineApi = createResource<JobCardLine>('/job-card-lines');
export const workshopApi = createResource<Workshop>('/workshops');
export const vendorInvoiceApi = createResource<VendorInvoice>('/vendor-invoices');
export const tyreApi = createResource<Tyre>('/tyres');
export const tyreMovementApi = createResource<TyreMovement>('/tyre-movements');
export const accessoryApi = createResource<Accessory>('/accessories');
export const accessoryEventApi = createResource<AccessoryEvent>('/accessory-events');
export const accompanimentApi = createResource<Accompaniment>('/accompaniments');
export const accompanimentIssueApi = createResource<AccompanimentIssue>('/accompaniment-issues');
export const approvalApi = createResource<ApprovalRequest>('/approvals');
export const alertApi = createResource<AlertEvent>('/alerts');
export const costLedgerApi = createResource<VehicleCostLedger>('/vehicle-cost-ledger');
export const itemApi = createResource<ItemMaster>('/items');
export const fuelVarianceApi = createResource<FuelVariance>('/fuel-variances');

export const inspectionTemplateApi = createResource<InspectionTemplate>('/inspection-templates');
export const routeFuelNormApi = createResource<RouteFuelNorm>('/route-fuel-norms');
export const complianceAlertApi = createResource<ComplianceAlertRecord>('/compliance-alerts');
export const tripApi = createResource<TripMaster>('/trips');
export const tollTransactionApi = createResource<TollTransaction>('/toll-transactions');
export const approvalMatrixApi = createResource<ApprovalMatrix>('/approval-matrix');
export const maintenanceScheduleApi = createResource<MaintenanceSchedule>('/maintenance-schedules');
export const maintenanceDueApi = createResource<MaintenanceDue>('/maintenance-due');
export const breakdownEventApi = createResource<BreakdownEvent>('/breakdown-events');
export const accidentEventApi = createResource<AccidentEvent>('/accident-events');
export const payableValidationApi = createResource<PayableValidation>('/payable-validations');
export const stockLedgerApi = createResource<StockLedger>('/stock-ledger');
export const inspectionEventApi = createResource<InspectionEvent>('/inspection-events');
export const inspectionResultLineApi = createResource<InspectionResultLine>('/inspection-result-lines');
export const integrationConfigApi = createResource<IntegrationConfig>('/integration-configs');
export const ulipApiLogApi = createResource<UlipApiLog>('/ulip-api-logs');
export const alertRuleApi = createResource<AlertRule>('/alert-rules');
export const documentApi = createResource<DocumentStore>('/documents');
export const userRecordApi = createResource<UserRecord>('/users');

export const batteryApi = createResource<Battery>('/batteries');
export const challanApi = createResource<Challan>('/challans');

export const epicStatusUploadApi = createResource<EpicStatusUpload>('/epic-status-uploads');
export const nonWorkingVehicleActionApi = createResource<NonWorkingVehicleAction>('/non-working-vehicle-actions');
export const handoverDocumentApi = createResource<HandoverDocument>('/handover-documents');
