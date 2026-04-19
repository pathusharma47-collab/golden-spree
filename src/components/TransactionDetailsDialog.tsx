import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { PaymentTransaction } from "@/hooks/usePaymentTransactions";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: PaymentTransaction | null;
}

const statusVariant = (status: string) => {
  switch (status) {
    case "success":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    case "failed":
      return "bg-destructive/10 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const Row = ({ label, value, copyable }: { label: string; value: React.ReactNode; copyable?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!copyable) return;
    navigator.clipboard.writeText(copyable);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wider pt-1">{label}</span>
      <div className="flex items-center gap-2 max-w-[60%]">
        <span className="text-sm font-medium text-foreground text-right break-all">{value}</span>
        {copyable && (
          <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground shrink-0">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const TransactionDetailsDialog = ({ open, onOpenChange, transaction }: Props) => {
  if (!transaction) return null;
  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Transaction Details</DialogTitle>
          <DialogDescription>Razorpay payment information</DialogDescription>
        </DialogHeader>

        <div className="text-center py-4 border-b border-border/50">
          <p className="text-3xl font-display font-bold text-foreground">
            ₹{Number(transaction.amount).toLocaleString("en-IN")}
          </p>
          <Badge variant="outline" className={`mt-2 ${statusVariant(transaction.status)}`}>
            {transaction.status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-0">
          <Row label="Description" value={transaction.description || "—"} />
          <Row label="Order ID" value={transaction.order_id} copyable={transaction.order_id} />
          {transaction.payment_id && (
            <Row label="Payment ID" value={transaction.payment_id} copyable={transaction.payment_id} />
          )}
          {transaction.method && <Row label="Method" value={transaction.method.toUpperCase()} />}
          <Row label="Currency" value={transaction.currency} />
          <Row label="Created" value={formatDate(transaction.created_at)} />
          <Row label="Updated" value={formatDate(transaction.updated_at)} />
          {transaction.signature && (
            <Row
              label="Signature"
              value={`${transaction.signature.slice(0, 12)}…`}
              copyable={transaction.signature}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
