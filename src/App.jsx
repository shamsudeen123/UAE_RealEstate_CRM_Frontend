import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PropertiesList from './pages/Properties/PropertiesList';
import PropertyForm from './pages/Properties/PropertyForm';
import PropertyDetail from './pages/Properties/PropertyDetail';
import ClientsList from './pages/Clients/ClientsList';
import ClientForm from './pages/Clients/ClientForm';
import LeadsPage from './pages/Leads/LeadsPage';
import LeadForm from './pages/Leads/LeadForm';
import DealsList from './pages/Deals/DealsList';
import DealForm from './pages/Deals/DealForm';
import ViewingsPage from './pages/Viewings/ViewingsPage';
import ExpensesList from './pages/Expenses/ExpensesList';
// import InvoicesList from './pages/Invoices/InvoicesList';
// import InvoiceDetail from './pages/Invoices/InvoiceDetail';
import ReportsPage from './pages/Reports/ReportsPage';
// import StaffPage from './pages/Staff/StaffPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Properties */}
        <Route path="properties" element={<PropertiesList />} />
        <Route path="properties/new" element={<ProtectedRoute allowedRoles={['admin', 'agent']}><PropertyForm /></ProtectedRoute>} />
        <Route path="properties/:id" element={<PropertyDetail />} />
        <Route path="properties/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'agent']}><PropertyForm /></ProtectedRoute>} />

        {/* Clients */}
        <Route path="clients" element={<ClientsList />} />
        <Route path="clients/new" element={<ProtectedRoute allowedRoles={['admin', 'agent']}><ClientForm /></ProtectedRoute>} />
        <Route path="clients/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'agent']}><ClientForm /></ProtectedRoute>} />

        {/* Leads */}
        <Route path="leads" element={<LeadsPage />} />
        <Route path="leads/new" element={<ProtectedRoute allowedRoles={['admin', 'agent']}><LeadForm /></ProtectedRoute>} />
        <Route path="leads/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'agent']}><LeadForm /></ProtectedRoute>} />

        {/* Deals */}
        <Route path="deals" element={<DealsList />} />
        <Route path="deals/new" element={<ProtectedRoute allowedRoles={['admin', 'agent']}><DealForm /></ProtectedRoute>} />
        <Route path="deals/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'agent']}><DealForm /></ProtectedRoute>} />

        {/* Viewings */}
        <Route path="viewings" element={<ViewingsPage />} />
        <Route path="viewings/new" element={<ViewingsPage />} />

        {/* Expenses */}
        <Route path="expenses" element={<ProtectedRoute allowedRoles={['admin', 'accountant']}><ExpensesList /></ProtectedRoute>} />

        {/* Invoices — disabled */}
        {/* <Route path="invoices" element={<ProtectedRoute allowedRoles={['admin', 'accountant']}><InvoicesList /></ProtectedRoute>} /> */}
        {/* <Route path="invoices/:id" element={<ProtectedRoute allowedRoles={['admin', 'accountant']}><InvoiceDetail /></ProtectedRoute>} /> */}

        {/* Reports */}
        <Route path="reports" element={<ProtectedRoute allowedRoles={['admin', 'accountant']}><ReportsPage /></ProtectedRoute>} />

        {/* Staff — disabled */}
        {/* <Route path="staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffPage /></ProtectedRoute>} /> */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
