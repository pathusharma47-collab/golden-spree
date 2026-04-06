import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import InvestScreen from "./pages/InvestScreen";
import RedeemScreen from "./pages/RedeemScreen";
import SIPScreen from "./pages/SIPScreen";
import GiftScreen from "./pages/GiftScreen";
import TransactionsScreen from "./pages/TransactionsScreen";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/invest" element={<InvestScreen />} />
            <Route path="/redeem" element={<RedeemScreen />} />
            <Route path="/sip" element={<SIPScreen />} />
            <Route path="/gift" element={<GiftScreen />} />
            <Route path="/transactions" element={<TransactionsScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
