import { createResource } from './resource';
import type {
  Branch, Vendor, Driver, Vehicle, Trailer, Coupling, FuelTransaction,
  AssetCompliance, ComplianceType, JobCard, JobCardLine, Workshop, VendorInvoice,
  Tyre, TyreMovement, Accessory, AccessoryEvent, Accompaniment, AccompanimentIssue,
  ApprovalRequest, AlertEvent, VehicleCostLedger, ItemMaster,
} from '../types/entities';
import type { FuelVariance } from '../types/entities-extra';

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
