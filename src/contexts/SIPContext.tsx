import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SIPPlan {
  id: string;
  name: string;
  metal: "gold" | "silver";
  monthlyAmount: number;
  duration: number;
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
  { id: "silver-lite", name: "Silver Lite", metal: "silver", monthlyAmount: 999, duration: 10, bonusReward: "+4g bonus silver", description: "Starter silver savings for 10 months" },
  { id: "silver-smart", name: "Silver Smart", metal: "silver", monthlyAmount: 4999, duration: 10, bonusReward: "+15g bonus silver", description: "Most popular — accelerated silver accumulation" },
  { id: "silver-elite", name: "Silver Elite", metal: "silver", monthlyAmount: 9999, duration: 10, bonusReward: "+30g bonus silver + 5% making charge discount", description: "Premium silver plan with making charge discount" },
  { id: "gold-lite", name: "Gold Lite", metal: "gold", monthlyAmount: 999, duration: 10, bonusReward: "+0.06g bonus gold", description: "Starter gold savings for 10 months" },
  { id: "gold-smart", name: "Gold Smart", metal: "gold", monthlyAmount: 3999, duration: 10, bonusReward: "+0.22g bonus gold", description: "Build your gold reserve over 10 months" },
  { id: "gold-elite", name: "Gold Elite", metal: "gold", monthlyAmount: 7999, duration: 10, bonusReward: "+0.50g bonus gold", description: "Premium gold accumulation plan" },
];

interface SIPContextType {
  activeSIPs: ActiveSIP[];
  loading: boolean;
  enrollInSIP: (plan: SIPPlan, firstInstallmentGrams?: number) => Promise<void>;
  payInstallment: (sipId: string, grams: number) => Promise<boolean>;
  pauseSIP: (sipId: string) => Promise<void>;
  resumeSIP: (sipId: string) => Promise<void>;
  cancelSIP: (sipId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const SIPContext = createContext<SIPContextType>({
  activeSIPs: [],
  loading: true,
  enrollInSIP: async () => {},
  payInstallment: async () => false,
  pauseSIP: async () => {},
  resumeSIP: async () => {},
  cancelSIP: async () => {},
  refresh: async () => {},
});

export const useSIP = () => useContext(SIPContext);

const rowToSIP = (r: any): ActiveSIP => ({
  id: r.id,
  planId: r.plan_id,
  planName: r.plan_name,
  metal: r.metal,
  monthlyAmount: Number(r.monthly_amount),
  duration: r.duration,
  bonusReward: r.bonus_reward ?? "",
  completedMonths: r.completed_months,
  totalInvested: Number(r.total_invested),
  totalGrams: Number(r.total_grams),
  status: r.status,
  startDate: r.start_date,
  nextDueDate: r.next_due_date,
});

export const SIPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeSIPs, setActiveSIPs] = useState<ActiveSIP[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setActiveSIPs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("active_sips")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setActiveSIPs((data ?? []).map(rowToSIP));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enrollInSIP = useCallback(
    async (plan: SIPPlan, firstInstallmentGrams = 0) => {
      if (!user) return;
      const now = new Date();
      const nextDue = new Date(now);
      nextDue.setMonth(nextDue.getMonth() + 1);
      nextDue.setDate(1);
      const hasFirst = firstInstallmentGrams > 0;
      await supabase.from("active_sips").insert({
        user_id: user.id,
        plan_id: plan.id,
        plan_name: plan.name,
        metal: plan.metal,
        monthly_amount: plan.monthlyAmount,
        duration: plan.duration,
        bonus_reward: plan.bonusReward,
        completed_months: hasFirst ? 1 : 0,
        total_invested: hasFirst ? plan.monthlyAmount : 0,
        total_grams: hasFirst ? firstInstallmentGrams : 0,
        status: "active",
        start_date: now.toISOString(),
        next_due_date: nextDue.toISOString(),
      });
      await refresh();
    },
    [user, refresh],
  );

  const payInstallment = useCallback(
    async (sipId: string, grams: number): Promise<boolean> => {
      const sip = activeSIPs.find((s) => s.id === sipId);
      if (!sip || sip.completedMonths >= sip.duration) return false;
      const nextDue = new Date(sip.nextDueDate);
      nextDue.setMonth(nextDue.getMonth() + 1);
      const newCompleted = sip.completedMonths + 1;
      const status = newCompleted >= sip.duration ? "completed" : sip.status;
      await supabase
        .from("active_sips")
        .update({
          completed_months: newCompleted,
          total_invested: sip.totalInvested + sip.monthlyAmount,
          total_grams: sip.totalGrams + grams,
          next_due_date: nextDue.toISOString(),
          status,
        })
        .eq("id", sipId);
      await refresh();
      return true;
    },
    [activeSIPs, refresh],
  );

  const updateStatus = async (sipId: string, status: ActiveSIP["status"]) => {
    await supabase.from("active_sips").update({ status }).eq("id", sipId);
    await refresh();
  };

  return (
    <SIPContext.Provider
      value={{
        activeSIPs,
        loading,
        enrollInSIP,
        payInstallment,
        pauseSIP: (id) => updateStatus(id, "paused"),
        resumeSIP: (id) => updateStatus(id, "active"),
        cancelSIP: (id) => updateStatus(id, "cancelled"),
        refresh,
      }}
    >
      {children}
    </SIPContext.Provider>
  );
};
