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
              <Route path="/fuel/:id" element={<FuelDetail />} />
              <Route path="/fuel/:id/edit" element={<FuelForm />} />
              <Route path="/fuel/new" element={<FuelForm />} />

              <Route path="/compliance" element={<ComplianceList />} />
              <Route path="/compliance/expiry" element={<ComplianceExpiryList />} />
              <Route path="/compliance/:id" element={<ComplianceDetail />} />
              <Route path="/compliance/:id/edit" element={<ComplianceForm />} />
              <Route path="/compliance/new" element={<ComplianceForm />} />

              <Route path="/job-cards" element={<JobCardList />} />
              <Route path="/job-cards/:id" element={<JobCardDetail />} />
              <Route path="/job-cards/:id/edit" element={<JobCardForm />} />
              <Route path="/job-cards/new" element={<JobCardForm />} />

              <Route path="/workshops" element={<WorkshopList />} />
              <Route path="/workshops/invoices" element={<InvoiceList />} />
              <Route path="/workshops/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/workshops/invoices/:id/edit" element={<InvoiceForm />} />
              <Route path="/workshops/invoices/new" element={<InvoiceForm />} />
              <Route path="/workshops/:id" element={<WorkshopDetail />} />
              <Route path="/workshops/:id/edit" element={<WorkshopForm />} />
              <Route path="/workshops/new" element={<WorkshopForm />} />

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
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
