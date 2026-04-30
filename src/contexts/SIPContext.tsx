import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface SIPPlan {
  id: string;
  name: string;
  metal: "gold" | "silver";
  monthlyAmount: number;
  duration: number; // months
  bonusReward: string;
  description: string;
}

export interface ActiveSIP {
  id: string;
  planId: string;
  planName: string;
  metal: "gold" | "silver";
  monthlyAmount: number;
  duration: number;
  bonusReward: string;
  completedMonths: number;
  startDate: string;
  nextDueDate: string;
  totalInvested: number;
  totalGrams: number;
  status: "active" | "paused" | "cancelled" | "completed";
}

export const SIP_PLANS: SIPPlan[] = [
  {
    id: "silver-lite",
    name: "Silver Lite",
    metal: "silver",
    monthlyAmount: 999,
    duration: 10,
    bonusReward: "+4g bonus silver",
    description: "Starter silver savings for 10 months",
  },
  {
    id: "silver-smart",
    name: "Silver Smart",
    metal: "silver",
    monthlyAmount: 4999,
    duration: 10,
    bonusReward: "+15g bonus silver",
    description: "Most popular — accelerated silver accumulation",
  },
  {
    id: "silver-elite",
    name: "Silver Elite",
    metal: "silver",
    monthlyAmount: 9999,
    duration: 10,
    bonusReward: "+30g bonus silver + 5% making charge discount",
    description: "Premium silver plan with making charge discount",
  },
  {
    id: "gold-lite",
    name: "Gold Lite",
    metal: "gold",
    monthlyAmount: 999,
    duration: 10,
    bonusReward: "+0.06g bonus gold",
    description: "Starter gold savings for 10 months",
  },
  {
    id: "gold-smart",
    name: "Gold Smart",
    metal: "gold",
    monthlyAmount: 3999,
    duration: 10,
    bonusReward: "+0.22g bonus gold",
    description: "Build your gold reserve over 10 months",
  },
  {
    id: "gold-elite",
    name: "Gold Elite",
    metal: "gold",
    monthlyAmount: 7999,
    duration: 10,
    bonusReward: "+0.50g bonus gold",
    description: "Premium gold accumulation plan",
  },
];

interface SIPContextType {
  activeSIPs: ActiveSIP[];
  enrollInSIP: (plan: SIPPlan) => void;
  payInstallment: (sipId: string, grams: number) => boolean;
  pauseSIP: (sipId: string) => void;
  resumeSIP: (sipId: string) => void;
  cancelSIP: (sipId: string) => void;
}

const SIPContext = createContext<SIPContextType>({
  activeSIPs: [],
  enrollInSIP: () => {},
  payInstallment: () => false,
  pauseSIP: () => {},
  resumeSIP: () => {},
  cancelSIP: () => {},
});

export const useSIP = () => useContext(SIPContext);

const getSIPKey = (email: string) => `active_sips_${email}`;

export const SIPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const sipKey = user ? getSIPKey(user.email) : "";

  const [activeSIPs, setActiveSIPs] = useState<ActiveSIP[]>(() => {
    if (!sipKey) return [];
    const stored = localStorage.getItem(sipKey);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (!sipKey) { setActiveSIPs([]); return; }
    const stored = localStorage.getItem(sipKey);
    setActiveSIPs(stored ? JSON.parse(stored) : []);
  }, [sipKey]);

  const persist = useCallback((sips: ActiveSIP[]) => {
    if (!sipKey) return;
    localStorage.setItem(sipKey, JSON.stringify(sips));
    setActiveSIPs(sips);
  }, [sipKey]);

  const enrollInSIP = useCallback((plan: SIPPlan) => {
    const now = new Date();
    const nextDue = new Date(now);
    nextDue.setMonth(nextDue.getMonth() + 1);
    nextDue.setDate(1);

    const newSIP: ActiveSIP = {
      id: `${plan.id}-${Date.now()}`,
      planId: plan.id,
      planName: plan.name,
      metal: plan.metal,
      monthlyAmount: plan.monthlyAmount,
      duration: plan.duration,
      bonusReward: plan.bonusReward,
      completedMonths: 0,
      startDate: now.toISOString(),
      nextDueDate: nextDue.toISOString(),
      totalInvested: 0,
      totalGrams: 0,
      status: "active",
    };
    persist([...activeSIPs, newSIP]);
  }, [activeSIPs, persist]);

  const payInstallment = useCallback((sipId: string, grams: number): boolean => {
    const idx = activeSIPs.findIndex(s => s.id === sipId);
    if (idx === -1) return false;
    const sip = activeSIPs[idx];
    if (sip.completedMonths >= sip.duration) return false;

    const updated = [...activeSIPs];
    const nextDue = new Date(sip.nextDueDate);
    nextDue.setMonth(nextDue.getMonth() + 1);

    updated[idx] = {
      ...sip,
      completedMonths: sip.completedMonths + 1,
      totalInvested: sip.totalInvested + sip.monthlyAmount,
      totalGrams: sip.totalGrams + grams,
      nextDueDate: nextDue.toISOString(),
    };
    persist(updated);
    return true;
  }, [activeSIPs, persist]);

  const pauseSIP = useCallback((sipId: string) => {
    const updated = activeSIPs.map(s => s.id === sipId ? { ...s, status: "paused" as const } : s);
    persist(updated);
  }, [activeSIPs, persist]);

  const resumeSIP = useCallback((sipId: string) => {
    const updated = activeSIPs.map(s => s.id === sipId ? { ...s, status: "active" as const } : s);
    persist(updated);
  }, [activeSIPs, persist]);

  const cancelSIP = useCallback((sipId: string) => {
    const updated = activeSIPs.map(s => s.id === sipId ? { ...s, status: "cancelled" as const } : s);
    persist(updated);
  }, [activeSIPs, persist]);

  return (
    <SIPContext.Provider value={{ activeSIPs, enrollInSIP, payInstallment, pauseSIP, resumeSIP, cancelSIP }}>
      {children}
    </SIPContext.Provider>
  );
};