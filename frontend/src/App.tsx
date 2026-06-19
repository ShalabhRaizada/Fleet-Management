import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/AppShell';
import { ToastProvider } from './components/Toast';
import Login from './pages/Login';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const VehicleList = React.lazy(() => import('./pages/vehicles/VehicleList'));
const VehicleForm = React.lazy(() => import('./pages/vehicles/VehicleForm'));
const VehicleDetail = React.lazy(() => import('./pages/vehicles/VehicleDetail'));

const TrailerList = React.lazy(() => import('./pages/trailers/TrailerList'));
const TrailerForm = React.lazy(() => import('./pages/trailers/TrailerForm'));
const TrailerDetail = React.lazy(() => import('./pages/trailers/TrailerDetail'));

const CouplingPage = React.lazy(() => import('./pages/coupling/CouplingPage'));

const FuelList = React.lazy(() => import('./pages/fuel/FuelList'));
const FuelForm = React.lazy(() => import('./pages/fuel/FuelForm'));
const FuelDetail = React.lazy(() => import('./pages/fuel/FuelDetail'));
const FuelPlannedVsActual = React.lazy(() => import('./pages/fuel/FuelPlannedVsActual'));

const ComplianceList = React.lazy(() => import('./pages/compliance/ComplianceList'));
const ComplianceForm = React.lazy(() => import('./pages/compliance/ComplianceForm'));
const ComplianceDetail = React.lazy(() => import('./pages/compliance/ComplianceDetail'));
const ComplianceExpiryList = React.lazy(() => import('./pages/compliance/ComplianceExpiryList'));
const VahanValidation = React.lazy(() => import('./pages/compliance/VahanValidation'));

const JobCardList = React.lazy(() => import('./pages/jobcards/JobCardList'));
const JobCardForm = React.lazy(() => import('./pages/jobcards/JobCardForm'));
const JobCardDetail = React.lazy(() => import('./pages/jobcards/JobCardDetail'));

const WorkshopList = React.lazy(() => import('./pages/workshops/WorkshopList'));
const WorkshopForm = React.lazy(() => import('./pages/workshops/WorkshopForm'));
const WorkshopDetail = React.lazy(() => import('./pages/workshops/WorkshopDetail'));
const InvoiceList = React.lazy(() => import('./pages/workshops/InvoiceList'));
const InvoiceForm = React.lazy(() => import('./pages/workshops/InvoiceForm'));
const InvoiceDetail = React.lazy(() => import('./pages/workshops/InvoiceDetail'));

const TyreList = React.lazy(() => import('./pages/tyres/TyreList'));
const TyreForm = React.lazy(() => import('./pages/tyres/TyreForm'));
const TyreDetail = React.lazy(() => import('./pages/tyres/TyreDetail'));
const TyreMovementAction = React.lazy(() => import('./pages/tyres/TyreMovementAction'));

const AccessoryList = React.lazy(() => import('./pages/accessories/AccessoryList'));
const AccessoryForm = React.lazy(() => import('./pages/accessories/AccessoryForm'));
const AccessoryDetail = React.lazy(() => import('./pages/accessories/AccessoryDetail'));

const AccompanimentList = React.lazy(() => import('./pages/accompaniments/AccompanimentList'));
const AccompanimentForm = React.lazy(() => import('./pages/accompaniments/AccompanimentForm'));
const AccompanimentIssuePage = React.lazy(() => import('./pages/accompaniments/AccompanimentIssuePage'));
const AccompanimentReturnPage = React.lazy(() => import('./pages/accompaniments/AccompanimentReturnPage'));

const ApprovalInbox = React.lazy(() => import('./pages/approvals/ApprovalInbox'));
const CostReport = React.lazy(() => import('./pages/reports/CostReport'));
const AlertDashboard = React.lazy(() => import('./pages/alerts/AlertDashboard'));

const InspectionTemplateList = React.lazy(() => import('./pages/inspections/InspectionTemplateList'));
const InspectionTemplateForm = React.lazy(() => import('./pages/inspections/InspectionTemplateForm'));
const InspectionTemplateDetail = React.lazy(() => import('./pages/inspections/InspectionTemplateDetail'));
const InspectionEventList = React.lazy(() => import('./pages/inspections/InspectionEventList'));
const InspectionEventForm = React.lazy(() => import('./pages/inspections/InspectionEventForm'));
const InspectionEventDetail = React.lazy(() => import('./pages/inspections/InspectionEventDetail'));
const InspectionResultLineList = React.lazy(() => import('./pages/inspections/InspectionResultLineList'));
const InspectionResultLineForm = React.lazy(() => import('./pages/inspections/InspectionResultLineForm'));
const InspectionResultLineDetail = React.lazy(() => import('./pages/inspections/InspectionResultLineDetail'));

const RouteFuelNormList = React.lazy(() => import('./pages/masters/RouteFuelNormList'));
const RouteFuelNormForm = React.lazy(() => import('./pages/masters/RouteFuelNormForm'));
const RouteFuelNormDetail = React.lazy(() => import('./pages/masters/RouteFuelNormDetail'));

const ComplianceAlertList = React.lazy(() => import('./pages/compliance/ComplianceAlertList'));
const ComplianceAlertForm = React.lazy(() => import('./pages/compliance/ComplianceAlertForm'));
const ComplianceAlertDetail = React.lazy(() => import('./pages/compliance/ComplianceAlertDetail'));

const TripList = React.lazy(() => import('./pages/trips/TripList'));
const TripForm = React.lazy(() => import('./pages/trips/TripForm'));
const TripDetail = React.lazy(() => import('./pages/trips/TripDetail'));
const TollTransactionList = React.lazy(() => import('./pages/trips/TollTransactionList'));
const TollTransactionForm = React.lazy(() => import('./pages/trips/TollTransactionForm'));
const TollTransactionDetail = React.lazy(() => import('./pages/trips/TollTransactionDetail'));

const ApprovalMatrixList = React.lazy(() => import('./pages/approvals/ApprovalMatrixList'));
const ApprovalMatrixForm = React.lazy(() => import('./pages/approvals/ApprovalMatrixForm'));
const ApprovalMatrixDetail = React.lazy(() => import('./pages/approvals/ApprovalMatrixDetail'));

const MaintenanceScheduleList = React.lazy(() => import('./pages/maintenance/MaintenanceScheduleList'));
const MaintenanceScheduleForm = React.lazy(() => import('./pages/maintenance/MaintenanceScheduleForm'));
const MaintenanceScheduleDetail = React.lazy(() => import('./pages/maintenance/MaintenanceScheduleDetail'));
const MaintenanceDueList = React.lazy(() => import('./pages/maintenance/MaintenanceDueList'));
const MaintenanceDueForm = React.lazy(() => import('./pages/maintenance/MaintenanceDueForm'));
const MaintenanceDueDetail = React.lazy(() => import('./pages/maintenance/MaintenanceDueDetail'));

const BreakdownEventList = React.lazy(() => import('./pages/breakdowns/BreakdownEventList'));
const BreakdownEventForm = React.lazy(() => import('./pages/breakdowns/BreakdownEventForm'));
const BreakdownEventDetail = React.lazy(() => import('./pages/breakdowns/BreakdownEventDetail'));
const AccidentEventList = React.lazy(() => import('./pages/breakdowns/AccidentEventList'));
const AccidentEventForm = React.lazy(() => import('./pages/breakdowns/AccidentEventForm'));
const AccidentEventDetail = React.lazy(() => import('./pages/breakdowns/AccidentEventDetail'));

const PayableValidationList = React.lazy(() => import('./pages/workshops/PayableValidationList'));
const PayableValidationForm = React.lazy(() => import('./pages/workshops/PayableValidationForm'));
const PayableValidationDetail = React.lazy(() => import('./pages/workshops/PayableValidationDetail'));

const StockLedgerList = React.lazy(() => import('./pages/inventory/StockLedgerList'));
const StockLedgerForm = React.lazy(() => import('./pages/inventory/StockLedgerForm'));
const StockLedgerDetail = React.lazy(() => import('./pages/inventory/StockLedgerDetail'));

const IntegrationConfigList = React.lazy(() => import('./pages/integrations/IntegrationConfigList'));
const IntegrationConfigForm = React.lazy(() => import('./pages/integrations/IntegrationConfigForm'));
const IntegrationConfigDetail = React.lazy(() => import('./pages/integrations/IntegrationConfigDetail'));
const UlipApiLogList = React.lazy(() => import('./pages/integrations/UlipApiLogList'));
const UlipApiLogDetail = React.lazy(() => import('./pages/integrations/UlipApiLogDetail'));

const AlertRuleList = React.lazy(() => import('./pages/alerts/AlertRuleList'));
const AlertRuleForm = React.lazy(() => import('./pages/alerts/AlertRuleForm'));
const AlertRuleDetail = React.lazy(() => import('./pages/alerts/AlertRuleDetail'));

const DocumentList = React.lazy(() => import('./pages/documents/DocumentList'));
const DocumentForm = React.lazy(() => import('./pages/documents/DocumentForm'));
const DocumentDetail = React.lazy(() => import('./pages/documents/DocumentDetail'));

const VendorList = React.lazy(() => import('./pages/vendors/VendorList'));
const VendorForm = React.lazy(() => import('./pages/vendors/VendorForm'));
const VendorDetail = React.lazy(() => import('./pages/vendors/VendorDetail'));

const UserList = React.lazy(() => import('./pages/users/UserList'));
const UserForm = React.lazy(() => import('./pages/users/UserForm'));
const UserDetail = React.lazy(() => import('./pages/users/UserDetail'));

const PdiWorkbench = React.lazy(() => import('./pages/inspections/PdiWorkbench'));
const HandoverList = React.lazy(() => import('./pages/inspections/HandoverList'));
const HandoverDetail = React.lazy(() => import('./pages/inspections/HandoverDetail'));
const Workbench = React.lazy(() => import('./pages/jobcards/Workbench'));
const NonWorkingList = React.lazy(() => import('./pages/vehicles/NonWorkingList'));
const ChallanList = React.lazy(() => import('./pages/challans/ChallanList'));
const ChallanForm = React.lazy(() => import('./pages/challans/ChallanForm'));
const ChallanDetail = React.lazy(() => import('./pages/challans/ChallanDetail'));
const BatteryList = React.lazy(() => import('./pages/batteries/BatteryList'));
const BatteryForm = React.lazy(() => import('./pages/batteries/BatteryForm'));
const BatteryDetail = React.lazy(() => import('./pages/batteries/BatteryDetail'));
const ComplianceReport = React.lazy(() => import('./pages/reports/ComplianceReport'));
const MaintenanceReport = React.lazy(() => import('./pages/reports/MaintenanceReport'));
const TyreCostReport = React.lazy(() => import('./pages/reports/TyreCostReport'));
const FleetHealthReport = React.lazy(() => import('./pages/reports/FleetHealthReport'));
const VendorPerformanceReport = React.lazy(() => import('./pages/reports/VendorPerformanceReport'));
const ChallanRegister = React.lazy(() => import('./pages/reports/ChallanRegister'));
const SettingsHome = React.lazy(() => import('./pages/settings/SettingsHome'));
const MfaSetup = React.lazy(() => import('./pages/settings/MfaSetup'));

const AuditLogList = React.lazy(() => import('./pages/audit/AuditLogList'));
const AuditLogDetail = React.lazy(() => import('./pages/audit/AuditLogDetail'));

const HsIncidentList = React.lazy(() => import('./pages/hsIncidents/HsIncidentList'));
const HsIncidentForm = React.lazy(() => import('./pages/hsIncidents/HsIncidentForm'));
const HsIncidentDetail = React.lazy(() => import('./pages/hsIncidents/HsIncidentDetail'));

const RouteLoadingFallback = () => (
  <div className="flex h-screen items-center justify-center text-gray-400 text-sm">
    Loading...
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <React.Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route element={<ProtectedRoute roles={['ADMIN', 'FLEET_MANAGER']} />}>
                <Route path="/vehicles" element={<VehicleList />} />
                <Route path="/vehicles/:id" element={<VehicleDetail />} />
                <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
                <Route path="/vehicles/new" element={<VehicleForm />} />

                <Route path="/trailers" element={<TrailerList />} />
                <Route path="/trailers/:id" element={<TrailerDetail />} />
                <Route path="/trailers/:id/edit" element={<TrailerForm />} />
                <Route path="/trailers/new" element={<TrailerForm />} />
              </Route>

              <Route path="/couplings" element={<CouplingPage />} />

              <Route path="/fuel" element={<FuelList />} />
              <Route path="/fuel/variance" element={<FuelPlannedVsActual />} />
              <Route path="/fuel/new" element={<FuelForm />} />
              <Route path="/fuel/:id" element={<FuelDetail />} />
              <Route path="/fuel/:id/edit" element={<FuelForm />} />

              <Route element={<ProtectedRoute roles={['ADMIN', 'FLEET_MANAGER']} />}>
                <Route path="/compliance" element={<ComplianceList />} />
                <Route path="/compliance/expiry" element={<ComplianceExpiryList />} />
                <Route path="/compliance/vahan-validation" element={<VahanValidation />} />
                <Route path="/compliance/new" element={<ComplianceForm />} />
                <Route path="/compliance/:id" element={<ComplianceDetail />} />
                <Route path="/compliance/:id/edit" element={<ComplianceForm />} />
              </Route>

              <Route element={<ProtectedRoute roles={['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR']} />}>
                <Route path="/job-cards" element={<JobCardList />} />
                <Route path="/job-cards/:id" element={<JobCardDetail />} />
                <Route path="/job-cards/:id/edit" element={<JobCardForm />} />
                <Route path="/job-cards/new" element={<JobCardForm />} />

                <Route path="/workshops" element={<WorkshopList />} />
                <Route path="/workshops/invoices" element={<InvoiceList />} />
                <Route path="/workshops/invoices/new" element={<InvoiceForm />} />
                <Route path="/workshops/invoices/:id" element={<InvoiceDetail />} />
                <Route path="/workshops/invoices/:id/edit" element={<InvoiceForm />} />
                <Route path="/workshops/new" element={<WorkshopForm />} />
                <Route path="/workshops/:id" element={<WorkshopDetail />} />
                <Route path="/workshops/:id/edit" element={<WorkshopForm />} />

                <Route path="/tyres" element={<TyreList />} />
                <Route path="/tyres/:id" element={<TyreDetail />} />
                <Route path="/tyres/:id/edit" element={<TyreForm />} />
                <Route path="/tyres/:id/fitment" element={<TyreMovementAction mode="fitment" />} />
                <Route path="/tyres/:id/removal" element={<TyreMovementAction mode="removal" />} />
                <Route path="/tyres/new" element={<TyreForm />} />

                <Route path="/accessories" element={<AccessoryList />} />
                <Route path="/accessories/:id" element={<AccessoryDetail />} />
                <Route path="/accessories/:id/edit" element={<AccessoryForm />} />
                <Route path="/accessories/new" element={<AccessoryForm />} />
              </Route>

              <Route path="/accompaniments" element={<AccompanimentList />} />
              <Route path="/accompaniments/returns" element={<AccompanimentReturnPage />} />
              <Route path="/accompaniments/:id/issue" element={<AccompanimentIssuePage />} />
              <Route path="/accompaniments/:id/edit" element={<AccompanimentForm />} />
              <Route path="/accompaniments/new" element={<AccompanimentForm />} />

              <Route path="/approvals" element={<ApprovalInbox />} />
              <Route element={<ProtectedRoute roles={['ADMIN', 'FLEET_MANAGER', 'APPROVER']} />}>
                <Route path="/reports/cost" element={<CostReport />} />
              </Route>
              <Route path="/alerts" element={<AlertDashboard />} />

              <Route path="/inspection-templates" element={<InspectionTemplateList />} />
              <Route path="/inspection-templates/:id" element={<InspectionTemplateDetail />} />
              <Route path="/inspection-templates/:id/edit" element={<InspectionTemplateForm />} />
              <Route path="/inspection-templates/new" element={<InspectionTemplateForm />} />

              <Route path="/inspection-events" element={<InspectionEventList />} />
              <Route path="/inspection-events/:id" element={<InspectionEventDetail />} />
              <Route path="/inspection-events/:id/edit" element={<InspectionEventForm />} />
              <Route path="/inspection-events/new" element={<InspectionEventForm />} />

              <Route path="/inspection-result-lines" element={<InspectionResultLineList />} />
              <Route path="/inspection-result-lines/:id" element={<InspectionResultLineDetail />} />
              <Route path="/inspection-result-lines/:id/edit" element={<InspectionResultLineForm />} />
              <Route path="/inspection-result-lines/new" element={<InspectionResultLineForm />} />

              <Route path="/route-fuel-norms" element={<RouteFuelNormList />} />
              <Route path="/route-fuel-norms/:id" element={<RouteFuelNormDetail />} />
              <Route path="/route-fuel-norms/:id/edit" element={<RouteFuelNormForm />} />
              <Route path="/route-fuel-norms/new" element={<RouteFuelNormForm />} />

              <Route path="/compliance-alerts" element={<ComplianceAlertList />} />
              <Route path="/compliance-alerts/:id" element={<ComplianceAlertDetail />} />
              <Route path="/compliance-alerts/:id/edit" element={<ComplianceAlertForm />} />
              <Route path="/compliance-alerts/new" element={<ComplianceAlertForm />} />

              <Route path="/trips" element={<TripList />} />
              <Route path="/trips/:id" element={<TripDetail />} />
              <Route path="/trips/:id/edit" element={<TripForm />} />
              <Route path="/trips/new" element={<TripForm />} />

              <Route path="/toll-transactions" element={<TollTransactionList />} />
              <Route path="/toll-transactions/:id" element={<TollTransactionDetail />} />
              <Route path="/toll-transactions/:id/edit" element={<TollTransactionForm />} />
              <Route path="/toll-transactions/new" element={<TollTransactionForm />} />

              <Route path="/approval-matrix" element={<ApprovalMatrixList />} />
              <Route path="/approval-matrix/:id" element={<ApprovalMatrixDetail />} />
              <Route path="/approval-matrix/:id/edit" element={<ApprovalMatrixForm />} />
              <Route path="/approval-matrix/new" element={<ApprovalMatrixForm />} />

              <Route path="/maintenance-schedules" element={<MaintenanceScheduleList />} />
              <Route path="/maintenance-schedules/:id" element={<MaintenanceScheduleDetail />} />
              <Route path="/maintenance-schedules/:id/edit" element={<MaintenanceScheduleForm />} />
              <Route path="/maintenance-schedules/new" element={<MaintenanceScheduleForm />} />

              <Route path="/maintenance-due" element={<MaintenanceDueList />} />
              <Route path="/maintenance-due/:id" element={<MaintenanceDueDetail />} />
              <Route path="/maintenance-due/:id/edit" element={<MaintenanceDueForm />} />
              <Route path="/maintenance-due/new" element={<MaintenanceDueForm />} />

              <Route path="/breakdown-events" element={<BreakdownEventList />} />
              <Route path="/breakdown-events/:id" element={<BreakdownEventDetail />} />
              <Route path="/breakdown-events/:id/edit" element={<BreakdownEventForm />} />
              <Route path="/breakdown-events/new" element={<BreakdownEventForm />} />

              <Route path="/accident-events" element={<AccidentEventList />} />
              <Route path="/accident-events/:id" element={<AccidentEventDetail />} />
              <Route path="/accident-events/:id/edit" element={<AccidentEventForm />} />
              <Route path="/accident-events/new" element={<AccidentEventForm />} />

              <Route path="/payable-validations" element={<PayableValidationList />} />
              <Route path="/payable-validations/:id" element={<PayableValidationDetail />} />
              <Route path="/payable-validations/:id/edit" element={<PayableValidationForm />} />
              <Route path="/payable-validations/new" element={<PayableValidationForm />} />

              <Route path="/stock-ledger" element={<StockLedgerList />} />
              <Route path="/stock-ledger/:id" element={<StockLedgerDetail />} />
              <Route path="/stock-ledger/:id/edit" element={<StockLedgerForm />} />
              <Route path="/stock-ledger/new" element={<StockLedgerForm />} />

              <Route path="/integration-configs" element={<IntegrationConfigList />} />
              <Route path="/integration-configs/:id" element={<IntegrationConfigDetail />} />
              <Route path="/integration-configs/:id/edit" element={<IntegrationConfigForm />} />
              <Route path="/integration-configs/new" element={<IntegrationConfigForm />} />

              <Route path="/ulip-api-logs" element={<UlipApiLogList />} />
              <Route path="/ulip-api-logs/:id" element={<UlipApiLogDetail />} />

              <Route path="/alert-rules" element={<AlertRuleList />} />
              <Route path="/alert-rules/:id" element={<AlertRuleDetail />} />
              <Route path="/alert-rules/:id/edit" element={<AlertRuleForm />} />
              <Route path="/alert-rules/new" element={<AlertRuleForm />} />

              <Route path="/documents" element={<DocumentList />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/documents/:id/edit" element={<DocumentForm />} />
              <Route path="/documents/new" element={<DocumentForm />} />

              <Route path="/vendors" element={<VendorList />} />
              <Route path="/vendors/:id" element={<VendorDetail />} />
              <Route path="/vendors/:id/edit" element={<VendorForm />} />
              <Route path="/vendors/new" element={<VendorForm />} />

              <Route path="/users" element={<UserList />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/users/:id/edit" element={<UserForm />} />
              <Route path="/users/new" element={<UserForm />} />

              <Route path="/pdi" element={<PdiWorkbench />} />
              <Route path="/workbench" element={<Workbench />} />
              <Route path="/vehicles/non-working" element={<NonWorkingList />} />
              <Route path="/handovers" element={<HandoverList />} />
              <Route path="/handovers/:id" element={<HandoverDetail />} />
              <Route path="/challans" element={<ChallanList />} />
              <Route path="/challans/:id" element={<ChallanDetail />} />
              <Route path="/challans/:id/edit" element={<ChallanForm />} />
              <Route path="/challans/new" element={<ChallanForm />} />

              <Route path="/batteries" element={<BatteryList />} />
              <Route path="/batteries/:id" element={<BatteryDetail />} />
              <Route path="/batteries/:id/edit" element={<BatteryForm />} />
              <Route path="/batteries/new" element={<BatteryForm />} />
              <Route path="/reports/compliance" element={<ComplianceReport />} />
              <Route path="/reports/maintenance" element={<MaintenanceReport />} />
              <Route path="/reports/tyre-cost" element={<TyreCostReport />} />
              <Route path="/reports/fleet-health" element={<FleetHealthReport />} />
              <Route path="/reports/vendor-performance" element={<VendorPerformanceReport />} />
              <Route path="/reports/challan-register" element={<ChallanRegister />} />
              <Route path="/settings" element={<SettingsHome />} />
              <Route path="/settings/mfa" element={<MfaSetup />} />

              <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                <Route path="/audit-log" element={<AuditLogList />} />
                <Route path="/audit-log/:id" element={<AuditLogDetail />} />
              </Route>

              <Route element={<ProtectedRoute roles={['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR']} />}>
                <Route path="/hs-incidents" element={<HsIncidentList />} />
                <Route path="/hs-incidents/:id" element={<HsIncidentDetail />} />
                <Route path="/hs-incidents/:id/edit" element={<HsIncidentForm />} />
                <Route path="/hs-incidents/new" element={<HsIncidentForm />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </React.Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
