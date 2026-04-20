import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { SIPProvider } from "@/contexts/SIPContext";
import Index from "./pages/Index";
import InvestScreen from "./pages/InvestScreen";
import RedeemScreen from "./pages/RedeemScreen";
import SIPScreen from "./pages/SIPScreen";
import GiftScreen from "./pages/GiftScreen";
import TransactionsScreen from "./pages/TransactionsScreen";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import WalletPage from "./pages/WalletPage";
import NotFound from "./pages/NotFound";
import SpinWheelScreen from "./pages/SpinWheelScreen";
import KYCScreen from "./pages/KYCScreen";
import NomineeScreen from "./pages/NomineeScreen";
import ReferScreen from "./pages/ReferScreen";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route path="/redeem" element={<ProtectedRoute><RedeemScreen /></ProtectedRoute>} />
          <Route path="/sip" element={<ProtectedRoute><SIPScreen /></ProtectedRoute>} />
          <Route path="/gift" element={<ProtectedRoute><GiftScreen /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionsScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/spin" element={<ProtectedRoute><SpinWheelScreen /></ProtectedRoute>} />
          <Route path="/kyc" element={<ProtectedRoute><KYCScreen /></ProtectedRoute>} />
          <Route path="/nominees" element={<ProtectedRoute><NomineeScreen /></ProtectedRoute>} />
          <Route path="/refer" element={<ProtectedRoute><ReferScreen /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {user && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WalletProvider>
            <SIPProvider>
              <AppRoutes />
            </SIPProvider>
          </WalletProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
