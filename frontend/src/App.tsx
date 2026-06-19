import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import VehicleList from './pages/vehicles/VehicleList';
import VehicleForm from './pages/vehicles/VehicleForm';
import VehicleDetail from './pages/vehicles/VehicleDetail';

import TrailerList from './pages/trailers/TrailerList';
import TrailerForm from './pages/trailers/TrailerForm';
import TrailerDetail from './pages/trailers/TrailerDetail';

import CouplingPage from './pages/coupling/CouplingPage';

import FuelList from './pages/fuel/FuelList';
import FuelForm from './pages/fuel/FuelForm';
import FuelDetail from './pages/fuel/FuelDetail';
import FuelPlannedVsActual from './pages/fuel/FuelPlannedVsActual';

import ComplianceList from './pages/compliance/ComplianceList';
import ComplianceForm from './pages/compliance/ComplianceForm';
import ComplianceDetail from './pages/compliance/ComplianceDetail';
import ComplianceExpiryList from './pages/compliance/ComplianceExpiryList';

import JobCardList from './pages/jobcards/JobCardList';
import JobCardForm from './pages/jobcards/JobCardForm';
import JobCardDetail from './pages/jobcards/JobCardDetail';

import WorkshopList from './pages/workshops/WorkshopList';
import WorkshopForm from './pages/workshops/WorkshopForm';
import WorkshopDetail from './pages/workshops/WorkshopDetail';
import InvoiceList from './pages/workshops/InvoiceList';
import InvoiceForm from './pages/workshops/InvoiceForm';
import InvoiceDetail from './pages/workshops/InvoiceDetail';

import TyreList from './pages/tyres/TyreList';
import TyreForm from './pages/tyres/TyreForm';
import TyreDetail from './pages/tyres/TyreDetail';
import TyreMovementAction from './pages/tyres/TyreMovementAction';

import AccessoryList from './pages/accessories/AccessoryList';
import AccessoryForm from './pages/accessories/AccessoryForm';
import AccessoryDetail from './pages/accessories/AccessoryDetail';

import AccompanimentList from './pages/accompaniments/AccompanimentList';
import AccompanimentForm from './pages/accompaniments/AccompanimentForm';
import AccompanimentIssuePage from './pages/accompaniments/AccompanimentIssuePage';
import AccompanimentReturnPage from './pages/accompaniments/AccompanimentReturnPage';

import ApprovalInbox from './pages/approvals/ApprovalInbox';
import CostReport from './pages/reports/CostReport';
import AlertDashboard from './pages/alerts/AlertDashboard';

import InspectionTemplateList from './pages/inspections/InspectionTemplateList';
import InspectionTemplateForm from './pages/inspections/InspectionTemplateForm';
import InspectionTemplateDetail from './pages/inspections/InspectionTemplateDetail';
import InspectionEventList from './pages/inspections/InspectionEventList';
import InspectionEventForm from './pages/inspections/InspectionEventForm';
import InspectionEventDetail from './pages/inspections/InspectionEventDetail';
import InspectionResultLineList from './pages/inspections/InspectionResultLineList';
import InspectionResultLineForm from './pages/inspections/InspectionResultLineForm';
import InspectionResultLineDetail from './pages/inspections/InspectionResultLineDetail';

import RouteFuelNormList from './pages/masters/RouteFuelNormList';
import RouteFuelNormForm from './pages/masters/RouteFuelNormForm';
import RouteFuelNormDetail from './pages/masters/RouteFuelNormDetail';

import ComplianceAlertList from './pages/compliance/ComplianceAlertList';
import ComplianceAlertForm from './pages/compliance/ComplianceAlertForm';
import ComplianceAlertDetail from './pages/compliance/ComplianceAlertDetail';

import TripList from './pages/trips/TripList';
import TripForm from './pages/trips/TripForm';
import TripDetail from './pages/trips/TripDetail';
import TollTransactionList from './pages/trips/TollTransactionList';
import TollTransactionForm from './pages/trips/TollTransactionForm';
import TollTransactionDetail from './pages/trips/TollTransactionDetail';

import ApprovalMatrixList from './pages/approvals/ApprovalMatrixList';
import ApprovalMatrixForm from './pages/approvals/ApprovalMatrixForm';
import ApprovalMatrixDetail from './pages/approvals/ApprovalMatrixDetail';

import MaintenanceScheduleList from './pages/maintenance/MaintenanceScheduleList';
import MaintenanceScheduleForm from './pages/maintenance/MaintenanceScheduleForm';
import MaintenanceScheduleDetail from './pages/maintenance/MaintenanceScheduleDetail';
import MaintenanceDueList from './pages/maintenance/MaintenanceDueList';
import MaintenanceDueForm from './pages/maintenance/MaintenanceDueForm';
import MaintenanceDueDetail from './pages/maintenance/MaintenanceDueDetail';

import BreakdownEventList from './pages/breakdowns/BreakdownEventList';
import BreakdownEventForm from './pages/breakdowns/BreakdownEventForm';
import BreakdownEventDetail from './pages/breakdowns/BreakdownEventDetail';
import AccidentEventList from './pages/breakdowns/AccidentEventList';
import AccidentEventForm from './pages/breakdowns/AccidentEventForm';
import AccidentEventDetail from './pages/breakdowns/AccidentEventDetail';

import PayableValidationList from './pages/workshops/PayableValidationList';
import PayableValidationForm from './pages/workshops/PayableValidationForm';
import PayableValidationDetail from './pages/workshops/PayableValidationDetail';

import StockLedgerList from './pages/inventory/StockLedgerList';
import StockLedgerForm from './pages/inventory/StockLedgerForm';
import StockLedgerDetail from './pages/inventory/StockLedgerDetail';

import IntegrationConfigList from './pages/integrations/IntegrationConfigList';
import IntegrationConfigForm from './pages/integrations/IntegrationConfigForm';
import IntegrationConfigDetail from './pages/integrations/IntegrationConfigDetail';
import UlipApiLogList from './pages/integrations/UlipApiLogList';
import UlipApiLogDetail from './pages/integrations/UlipApiLogDetail';

import AlertRuleList from './pages/alerts/AlertRuleList';
import AlertRuleForm from './pages/alerts/AlertRuleForm';
import AlertRuleDetail from './pages/alerts/AlertRuleDetail';

import DocumentList from './pages/documents/DocumentList';
import DocumentForm from './pages/documents/DocumentForm';
import DocumentDetail from './pages/documents/DocumentDetail';

import VendorList from './pages/vendors/VendorList';
import VendorForm from './pages/vendors/VendorForm';
import VendorDetail from './pages/vendors/VendorDetail';

import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import UserDetail from './pages/users/UserDetail';

import PdiWorkbench from './pages/inspections/PdiWorkbench';
import HandoverList from './pages/inspections/HandoverList';
import HandoverDetail from './pages/inspections/HandoverDetail';
import Workbench from './pages/jobcards/Workbench';
import NonWorkingList from './pages/vehicles/NonWorkingList';
import ChallanList from './pages/challans/ChallanList';
import ChallanForm from './pages/challans/ChallanForm';
import ChallanDetail from './pages/challans/ChallanDetail';
import BatteryList from './pages/batteries/BatteryList';
import BatteryForm from './pages/batteries/BatteryForm';
import BatteryDetail from './pages/batteries/BatteryDetail';
import ComplianceReport from './pages/reports/ComplianceReport';
import MaintenanceReport from './pages/reports/MaintenanceReport';
import TyreCostReport from './pages/reports/TyreCostReport';
import FleetHealthReport from './pages/reports/FleetHealthReport';
import VendorPerformanceReport from './pages/reports/VendorPerformanceReport';
import ChallanRegister from './pages/reports/ChallanRegister';
import SettingsHome from './pages/settings/SettingsHome';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/vehicles" element={<VehicleList />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
              <Route path="/vehicles/new" element={<VehicleForm />} />

              <Route path="/trailers" element={<TrailerList />} />
              <Route path="/trailers/:id" element={<TrailerDetail />} />
              <Route path="/trailers/:id/edit" element={<TrailerForm />} />
              <Route path="/trailers/new" element={<TrailerForm />} />

              <Route path="/couplings" element={<CouplingPage />} />

              <Route path="/fuel" element={<FuelList />} />
              <Route path="/fuel/variance" element={<FuelPlannedVsActual />} />
              <Route path="/fuel/new" element={<FuelForm />} />
              <Route path="/fuel/:id" element={<FuelDetail />} />
              <Route path="/fuel/:id/edit" element={<FuelForm />} />

              <Route path="/compliance" element={<ComplianceList />} />
              <Route path="/compliance/expiry" element={<ComplianceExpiryList />} />
              <Route path="/compliance/new" element={<ComplianceForm />} />
              <Route path="/compliance/:id" element={<ComplianceDetail />} />
              <Route path="/compliance/:id/edit" element={<ComplianceForm />} />

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

              <Route path="/accompaniments" element={<AccompanimentList />} />
              <Route path="/accompaniments/returns" element={<AccompanimentReturnPage />} />
              <Route path="/accompaniments/:id/issue" element={<AccompanimentIssuePage />} />
              <Route path="/accompaniments/:id/edit" element={<AccompanimentForm />} />
              <Route path="/accompaniments/new" element={<AccompanimentForm />} />

              <Route path="/approvals" element={<ApprovalInbox />} />
              <Route path="/reports/cost" element={<CostReport />} />
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
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
