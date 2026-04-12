import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UserCheck, Plus, Pencil, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Nominee {
  id: string;
  nominee_name: string;
  relationship: string;
  nominee_dob: string | null;
  nominee_pan: string | null;
  nominee_phone: string | null;
  percentage: number;
}

const RELATIONSHIPS = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other"];

const NomineeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Nominee | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [dob, setDob] = useState("");
  const [pan, setPan] = useState("");
  const [phone, setPhone] = useState("");
  const [percentage, setPercentage] = useState("100");

  const fetchNominees = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("nominees")
      .select("*")
      .eq("user_email", user.email)
      .order("created_at", { ascending: true });

    if (!error && data) setNominees(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNominees();
  }, [user]);

  const resetForm = () => {
    setName("");
    setRelationship("");
    setDob("");
    setPan("");
    setPhone("");
    setPercentage("100");
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (n: Nominee) => {
    setEditing(n);
    setName(n.nominee_name);
    setRelationship(n.relationship);
    setDob(n.nominee_dob || "");
    setPan(n.nominee_pan || "");
    setPhone(n.nominee_phone || "");
    setPercentage(String(n.percentage));
    setShowForm(true);
  };

  const openAdd = () => {
    resetForm();
    // Calculate remaining percentage
    const used = nominees.reduce((s, n) => s + n.percentage, 0);
    setPercentage(String(Math.max(0, 100 - used)));
    setShowForm(true);
  };

  const totalPercentage = () => {
    const othersTotal = nominees
      .filter((n) => n.id !== editing?.id)
      .reduce((s, n) => s + n.percentage, 0);
    return othersTotal + (parseInt(percentage) || 0);
  };

  const isFormValid = () => {
    return (
      name.trim().length >= 2 &&
      relationship.length > 0 &&
      (parseInt(percentage) || 0) > 0 &&
      totalPercentage() <= 100 &&
      (phone.length === 0 || phone.length === 10)
    );
  };

  const handleSave = async () => {
    if (!user || !isFormValid()) return;
    setSaving(true);

    const payload = {
      user_email: user.email,
      nominee_name: name.trim(),
      relationship,
      nominee_dob: dob || null,
      nominee_pan: pan || null,
      nominee_phone: phone || null,
      percentage: parseInt(percentage) || 100,
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from("nominees")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Nominee Updated ✅", description: `${name} has been updated.` });
      } else {
        const { error } = await supabase.from("nominees").insert(payload);
        if (error) throw error;
        toast({ title: "Nominee Added ✅", description: `${name} has been added as nominee.` });
      }
      resetForm();
      await fetchNominees();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from("nominees").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Nominee Removed", description: "Nominee has been removed." });
      await fetchNominees();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const usedPercentage = nominees.reduce((s, n) => s + n.percentage, 0);

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
          <h1 className="font-display text-xl font-bold text-foreground">Nominees</h1>
          <p className="text-xs text-muted-foreground">Manage your nominee details</p>
        </div>
        <UserCheck size={20} className="text-primary ml-auto" />
      </div>

      {/* Info */}
      <div className="glass-card p-4 mb-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertCircle size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">Why add a nominee?</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Nominees can claim your digital gold holdings in case of any unforeseen event. Total allocation must equal 100%.
          </p>
        </div>
      </div>

      {/* Percentage Bar */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground">Allocation</p>
          <p className={`text-xs font-bold ${usedPercentage === 100 ? "text-emerald-600" : usedPercentage > 100 ? "text-destructive" : "text-muted-foreground"}`}>
            {usedPercentage}% / 100%
          </p>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${usedPercentage === 100 ? "bg-emerald-500" : usedPercentage > 100 ? "bg-destructive" : "gold-gradient"}`}
            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
          />
        </div>
        {usedPercentage === 100 && (
          <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 size={10} /> Fully allocated
          </p>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Nominee List */}
          <div className="space-y-3 mb-4">
            {nominees.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{n.nominee_name}</p>
                      <p className="text-[11px] text-muted-foreground">{n.relationship}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{n.percentage}%</p>
                  </div>
                </div>
                {(n.nominee_phone || n.nominee_dob) && (
                  <div className="mt-2 pt-2 border-t border-border/30 flex gap-4 text-[10px] text-muted-foreground">
                    {n.nominee_phone && <span>📱 {n.nominee_phone}</span>}
                    {n.nominee_dob && <span>🎂 {new Date(n.nominee_dob).toLocaleDateString("en-IN")}</span>}
                    {n.nominee_pan && <span>📄 {n.nominee_pan.slice(0, 3)}****{n.nominee_pan.slice(-1)}</span>}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(n)}
                    className="flex-1 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    disabled={deleting === n.id}
                    className="flex-1 py-2 rounded-xl bg-destructive/5 border border-destructive/20 text-xs font-semibold text-destructive flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    {deleting === n.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}

            {nominees.length === 0 && (
              <div className="glass-card p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <UserCheck size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">No nominees added</p>
                <p className="text-xs text-muted-foreground">Add a nominee to secure your holdings</p>
              </div>
            )}
          </div>

          {/* Add Button */}
          {usedPercentage < 100 && (
            <Button
              onClick={openAdd}
              className="w-full gold-gradient gold-glow text-primary-foreground font-semibold rounded-2xl py-3"
            >
              <Plus size={16} className="mr-2" /> Add Nominee
            </Button>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card w-full max-w-lg rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg font-bold text-foreground">
                  {editing ? "Edit Nominee" : "Add Nominee"}
                </h2>
                <button onClick={() => resetForm()} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Enter nominee's full name"
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, "").slice(0, 80))}
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                {/* Relationship */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Relationship <span className="text-destructive">*</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIPS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRelationship(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          relationship === r
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DOB */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Date of Birth</Label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phone Number</Label>
                  <Input
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="bg-muted/50 border-border/50"
                  />
                  {phone.length > 0 && phone.length !== 10 && (
                    <p className="text-[10px] text-destructive">Must be 10 digits</p>
                  )}
                </div>

                {/* PAN */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">PAN Number</Label>
                  <Input
                    placeholder="e.g. ABCPD1234E"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                    maxLength={10}
                    className="bg-muted/50 border-border/50 uppercase tracking-widest font-mono"
                  />
                </div>

                {/* Percentage */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Share Percentage <span className="text-destructive">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      className="bg-muted/50 border-border/50 w-24"
                    />
                    <span className="text-sm text-muted-foreground font-semibold">%</span>
                  </div>
                  {totalPercentage() > 100 && (
                    <p className="text-[10px] text-destructive flex items-center gap-1">
                      <AlertCircle size={10} /> Total exceeds 100% ({totalPercentage()}%)
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={!isFormValid() || saving}
                  className="w-full gold-gradient gold-glow text-primary-foreground font-semibold rounded-2xl py-3 mt-2"
                >
                  {saving ? (
                    <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving...</span>
                  ) : (
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {editing ? "Update Nominee" : "Add Nominee"}</span>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NomineeScreen;
