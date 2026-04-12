import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

/**
 * PAN Format: ABCDE1234F
 * - Chars 1-3: Alphabetic (A-Z)
 * - Char 4: Entity type (C=Company, P=Person, H=HUF, F=Firm, A=AOP, T=Trust, B=BOI, L=Local Authority, J=AJP, G=Govt)
 * - Char 5: First letter of last name (for individuals)
 * - Chars 6-9: Numeric (0001-9999)
 * - Char 10: Alphabetic check digit
 */
const PAN_REGEX = /^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$/;
const VALID_ENTITY_TYPES = ["C", "P", "H", "F", "A", "T", "B", "L", "J", "G"];

interface PANValidation {
  valid: boolean;
  message: string;
  details?: string;
}

const validatePAN = (pan: string, lastName: string): PANValidation => {
  const cleaned = pan.toUpperCase().trim();

  if (cleaned.length === 0) return { valid: false, message: "PAN number is required" };
  if (cleaned.length !== 10) return { valid: false, message: "PAN must be exactly 10 characters" };
  if (!PAN_REGEX.test(cleaned)) return { valid: false, message: "Invalid PAN format. Expected: ABCDE1234F" };

  const entityChar = cleaned[3];
  if (!VALID_ENTITY_TYPES.includes(entityChar)) {
    return { valid: false, message: `Invalid entity type character '${entityChar}'` };
  }

  // For individual PANs (4th char = P), 5th char should match first letter of last name
  if (entityChar === "P" && lastName.trim().length > 0) {
    const expectedChar = lastName.trim()[0].toUpperCase();
    if (cleaned[4] !== expectedChar) {
      return {
        valid: false,
        message: `PAN 5th character '${cleaned[4]}' doesn't match last name initial '${expectedChar}'`,
        details: "For individual PANs, the 5th character should be the first letter of your last name.",
      };
    }
  }

  // Check it's an individual PAN
  if (entityChar !== "P") {
    return {
      valid: false,
      message: "Only individual PANs (4th character 'P') are accepted for KYC",
    };
  }

  return { valid: true, message: "PAN is valid ✓" };
};

const KYCScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [dob, setDob] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [panValidation, setPanValidation] = useState<PANValidation | null>(null);

  const handlePanChange = (value: string) => {
    const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    setPanNumber(upper);
    if (upper.length === 10) {
      setPanValidation(validatePAN(upper, lastName));
    } else if (upper.length > 0) {
      setPanValidation({ valid: false, message: `${10 - upper.length} more characters needed` });
    } else {
      setPanValidation(null);
    }
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    // Re-validate PAN if already entered
    if (panNumber.length === 10) {
      setPanValidation(validatePAN(panNumber, value));
    }
  };

  const isFormValid = () => {
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      panNumber.length === 10 &&
      panValidation?.valid &&
      dob.length > 0 &&
      isAgeValid()
    );
  };

  const isAgeValid = () => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  };

  const handleSubmit = async () => {
    if (!user || !isFormValid()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("kyc_details").upsert(
        {
          user_email: user.email,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          pan_number: panNumber,
          date_of_birth: dob,
          status: "verified",
        },
        { onConflict: "user_email" }
      );

      if (error) throw error;

      toast({
        title: "KYC Verified! ✅",
        description: "Your identity has been verified. Wallet is now enabled.",
      });
      navigate("/wallet");
    } catch (err: any) {
      toast({
        title: "KYC Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 pt-12 pb-28 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center border border-border/50">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">KYC Verification</h1>
          <p className="text-xs text-muted-foreground">Complete KYC to enable your wallet</p>
        </div>
        <ShieldCheck size={20} className="text-primary ml-auto" />
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-4 flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertCircle size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">Why KYC?</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            As per RBI guidelines, KYC is mandatory to buy, sell, or hold digital gold. Your data is encrypted and secure.
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 space-y-4"
      >
        {/* First Name */}
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs font-semibold text-foreground">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, "").slice(0, 50))}
            className="bg-muted/50 border-border/50"
          />
        </div>

        {/* Last Name */}
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs font-semibold text-foreground">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => handleLastNameChange(e.target.value.replace(/[^a-zA-Z\s]/g, "").slice(0, 50))}
            className="bg-muted/50 border-border/50"
          />
        </div>

        {/* PAN Number */}
        <div className="space-y-1.5">
          <Label htmlFor="pan" className="text-xs font-semibold text-foreground">
            PAN Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pan"
            placeholder="e.g. ABCPD1234E"
            value={panNumber}
            onChange={(e) => handlePanChange(e.target.value)}
            maxLength={10}
            className={`bg-muted/50 border-border/50 uppercase tracking-widest font-mono ${
              panValidation
                ? panValidation.valid
                  ? "border-emerald-500 focus-visible:ring-emerald-500"
                  : "border-destructive focus-visible:ring-destructive"
                : ""
            }`}
          />
          {panValidation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`flex items-start gap-1.5 text-[11px] mt-1 ${
                panValidation.valid ? "text-emerald-600" : "text-destructive"
              }`}
            >
              {panValidation.valid ? <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />}
              <div>
                <p>{panValidation.message}</p>
                {panValidation.details && <p className="text-muted-foreground mt-0.5">{panValidation.details}</p>}
              </div>
            </motion.div>
          )}
          <p className="text-[10px] text-muted-foreground">Format: 5 letters + 4 digits + 1 letter (e.g. ABCPD1234E)</p>
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <Label htmlFor="dob" className="text-xs font-semibold text-foreground">
            Date of Birth <span className="text-destructive">*</span>
          </Label>
          <Input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
            className="bg-muted/50 border-border/50"
          />
          {dob && !isAgeValid() && (
            <p className="text-[11px] text-destructive flex items-center gap-1">
              <AlertCircle size={12} /> You must be at least 18 years old
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid() || submitting}
          className="w-full gold-gradient gold-glow text-primary-foreground font-semibold py-3 rounded-2xl mt-2"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Verifying...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} /> Verify & Enable Wallet
            </span>
          )}
        </Button>
      </motion.div>

      {/* PAN Info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 mt-4"
      >
        <p className="text-xs font-semibold text-foreground mb-2">PAN Validation Rules</p>
        <ul className="text-[11px] text-muted-foreground space-y-1">
          <li>• Must be 10 characters: 5 letters + 4 digits + 1 letter</li>
          <li>• 4th character must be 'P' for individual PAN</li>
          <li>• 5th character must match your last name initial</li>
          <li>• Example: If last name is "Sharma", PAN format: ABC<b>P</b><b>S</b>1234X</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default KYCScreen;
