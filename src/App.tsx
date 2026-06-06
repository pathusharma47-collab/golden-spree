import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WalletProvider } from "@/contexts/WalletContext";
import { SIPProvider } from "@/contexts/SIPContext";
import Index from "./pages/Index";
import InvestScreen from "./pages/InvestScreen";
import RedeemScreen from "./pages/RedeemScreen";
import SIPScreen from "./pages/SIPScreen";
import GiftScreen from "./pages/GiftScreen";
import TransactionsScreen from "./pages/TransactionsScreen";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import WalletPage from "./pages/WalletPage";
import NotFound from "./pages/NotFound";
import SpinWheelScreen from "./pages/SpinWheelScreen";
import KYCScreen from "./pages/KYCScreen";
import NomineeScreen from "./pages/NomineeScreen";
import ReferScreen from "./pages/ReferScreen";
import TermsScreen from "./pages/TermsScreen";
import PrivacyScreen from "./pages/PrivacyScreen";
import RefundScreen from "./pages/RefundScreen";
import DeliveryScreen from "./pages/DeliveryScreen";
import LockerScreen from "./pages/LockerScreen";
import NotificationsPage from "./pages/NotificationsPage";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import PinLockScreen, { hasPin } from "./components/PinLockScreen";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [unlocked, setUnlocked] = useState<boolean>(
    () => sessionStorage.getItem("ma_unlocked") === "1",
  );

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem("ma_unlocked");
      setUnlocked(false);
    }
  }, [user]);

  // Lock-only logout: AuthContext dispatches "ma:lock" → drop to PIN screen
  // without ending the Supabase session.
  useEffect(() => {
    const onLock = () => setUnlocked(false);
    window.addEventListener("ma:lock", onLock);
    return () => window.removeEventListener("ma:lock", onLock);
  }, []);

  if (!splashDone || loading) return <SplashScreen />;

  const showLock = !!user && !unlocked;
  const lockMode = user && hasPin(user.id) ? "unlock" : "create";

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route path="/invest" element={<ProtectedRoute><InvestScreen /></ProtectedRoute>} />
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
          <Route path="/terms" element={<TermsScreen />} />
          <Route path="/privacy" element={<PrivacyScreen />} />
          <Route path="/refund" element={<RefundScreen />} />
          <Route path="/delivery" element={<DeliveryScreen />} />
          <Route path="/locker/:type" element={<ProtectedRoute><LockerScreen /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {user && !showLock && <BottomNav />}
      {showLock && (
        <PinLockScreen
          mode={lockMode}
          onSuccess={() => {
            sessionStorage.setItem("ma_unlocked", "1");
            setUnlocked(true);
          }}
        />
      )}
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <WalletProvider>
              <SIPProvider>
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </SIPProvider>
            </WalletProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
