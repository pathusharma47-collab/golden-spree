import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface KYCStatus {
  isVerified: boolean;
  loading: boolean;
  kycData: {
    first_name: string;
    last_name: string;
    pan_number: string;
    date_of_birth: string;
    status: string;
  } | null;
  refetch: () => void;
}

export const useKYC = (): KYCStatus => {
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kycData, setKycData] = useState<KYCStatus["kycData"]>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      setIsVerified(false);
      setLoading(false);
      setKycData(null);
      return;
    }

    const fetchKYC = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("kyc_details")
        .select("first_name, last_name, pan_number, date_of_birth, status")
        .eq("user_email", user.email)
        .maybeSingle();

      if (!error && data && data.status === "verified") {
        setIsVerified(true);
        setKycData(data);
      } else {
        setIsVerified(false);
        setKycData(null);
      }
      setLoading(false);
    };

    fetchKYC();
  }, [user, trigger]);

  return { isVerified, loading, kycData, refetch: () => setTrigger((t) => t + 1) };
};
