import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Animals from './pages/Animals';
import AddAnimal from './pages/AddAnimal';
import AnimalDetails from './pages/AnimalDetails';
import Expenses from './pages/Expenses';
import Feed from './pages/Feed';
import Medicine from './pages/Medicine';
import Sales from './pages/Sales';
import ProfitCalculator from './pages/ProfitCalculator';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Pregnancy from './pages/Pregnancy';
import ModuleSelect from './pages/ModuleSelect';
import Crops from './pages/Crops';
import CropDashboard from './pages/CropDashboard';
import CropReports from './pages/CropReports';
import Dairy from './pages/Dairy';
import DairySupplier from './pages/DairySupplier';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-[#B3B3B3]">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/' : '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Protected><ModuleSelect /></Protected>} />
        <Route path="/farm" element={<Protected><AppLayout /></Protected>}>
          <Route index element={<Dashboard />} />
          <Route path="animals" element={<Animals />} />
          <Route path="animals/new" element={<AddAnimal />} />
          <Route path="animals/:id" element={<AnimalDetails />} />
          <Route path="pregnancy" element={<Pregnancy />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="feed" element={<Feed />} />
          <Route path="medicine" element={<Medicine />} />
          <Route path="sales" element={<Sales />} />
          <Route path="profit-calculator" element={<ProfitCalculator />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/crops" element={<Protected><AppLayout /></Protected>}>
          <Route index element={<Crops />} />
          <Route path="reports" element={<CropReports />} />
          <Route path=":seasonId" element={<CropDashboard />} />
        </Route>
        <Route path="/dairy" element={<Protected><AppLayout /></Protected>}>
          <Route index element={<Dairy />} />
          <Route path=":supplierId" element={<DairySupplier />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </AuthProvider>
  );
}
