import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatCurrency, calculateExpectedCommission, calculateAgentShare, calculateReferralShare } from "@/lib/utils";
import { DollarSign, Percent, Calculator, Save, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface CommissionTabProps {
  project: any;
}

export default function CommissionTab({ project }: CommissionTabProps) {
  const { role } = useCurrentUser();
  const isAdmin = role === "admin";
  const isAgent = role === "agent";
  const isViewer = role === "viewer";
  const updateCommission = useMutation(api.projects.updateCommission);

  const [formData, setFormData] = useState({
    bankCommissionRate: project.bankCommissionRate || 0,
    agentCommissionRate: project.agentCommissionRate || 0,
    referralCommissionRate: project.referralCommissionRate || 0,
    finalCommission: project.finalCommission || 0,
  });

  const expectedTotal = calculateExpectedCommission(project.loanAmount, formData.bankCommissionRate);
  const agentShare = calculateAgentShare(expectedTotal, formData.agentCommissionRate);
  const referralShare = calculateReferralShare(expectedTotal, formData.referralCommissionRate);

  const finalAgentPayout = calculateAgentShare(formData.finalCommission, formData.agentCommissionRate);
  const finalReferralPayout = calculateReferralShare(formData.finalCommission, formData.referralCommissionRate);

  const handleSave = async () => {
    try {
      await updateCommission({ id: project._id, ...formData });
      toast.success("Commission data updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isAdmin && !isViewer && !isAgent) return null;

  // Agent limited view
  if (isAgent) {
    return (
      <div className="space-y-6">
        <div className="max-w-xl mx-auto">
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="bg-primary text-primary-foreground border-b border-primary/10">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calculator className="w-5 h-5" /> Commission Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <Label className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Loan Amount</Label>
                  <div className="text-2xl font-bold text-foreground">{formatCurrency(project.loanAmount)}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Final Commission Received</Label>
                  <div className="text-2xl font-bold text-foreground">{formatCurrency(formData.finalCommission)}</div>
                  <p className="text-[10px] text-muted-foreground italic">Actual amount received by the company from the bank.</p>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20">
                    <Label className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest">Your Final Payout</Label>
                    <div className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(finalAgentPayout)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin/Viewer view (Full)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="bg-muted/50 border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Calculator className="w-5 h-5 text-primary" /> Commission Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!isAdmin ? (
                <div className="bg-muted p-6 rounded-2xl border border-border/50 flex items-center gap-4 text-muted-foreground italic">
                  <ShieldAlert className="w-6 h-6" />
                  <p>You have read-only access to commission details.</p>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Loan Amount (Reference)</Label>
                    <div className="text-xl font-bold text-foreground">{formatCurrency(project.loanAmount)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankRate" className="text-foreground/80">Bank Commission Rate (%)</Label>
                    <div className="relative">
                      <Input 
                        id="bankRate"
                        type="number"
                        step="0.01"
                        disabled={!isAdmin}
                        value={formData.bankCommissionRate}
                        onChange={e => setFormData({...formData, bankCommissionRate: parseFloat(e.target.value)})}
                        className="rounded-xl pl-10 bg-muted/50 border-border"
                      />
                      <Percent className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agentRate" className="text-foreground/80">Agent Commission Rate (%)</Label>
                    <div className="relative">
                      <Input 
                        id="agentRate"
                        type="number"
                        step="0.01"
                        disabled={!isAdmin}
                        value={formData.agentCommissionRate}
                        onChange={e => setFormData({...formData, agentCommissionRate: parseFloat(e.target.value)})}
                        className="rounded-xl pl-10 bg-muted/50 border-border"
                      />
                      <Percent className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="referralRate" className="text-foreground/80">Referral Commission Rate (%)</Label>
                    <div className="relative">
                      <Input 
                        id="referralRate"
                        type="number"
                        step="0.01"
                        disabled={!isAdmin}
                        value={formData.referralCommissionRate}
                        onChange={e => setFormData({...formData, referralCommissionRate: parseFloat(e.target.value)})}
                        className="rounded-xl pl-10 bg-muted/50 border-border"
                      />
                      <Percent className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="finalComm" className="text-primary font-bold">Final Commission Received (AED)</Label>
                    <div className="relative">
                      <Input 
                        id="finalComm"
                        type="number"
                        disabled={!isAdmin}
                        value={formData.finalCommission}
                        onChange={e => setFormData({...formData, finalCommission: parseFloat(e.target.value)})}
                        className="rounded-xl pl-10 border-primary/20 bg-primary/5 focus:ring-primary/20 text-lg font-bold text-foreground"
                      />
                      <DollarSign className="w-4 h-4 text-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">Enter actual amount received from the bank post-disbursement.</p>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
                  <Button onClick={handleSave} className="rounded-xl gap-2 px-8">
                    <Save className="w-4 h-4" /> Save Commission Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Projections */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-border shadow-sm bg-primary text-primary-foreground overflow-hidden">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-lg font-bold">Payout Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-primary-foreground/60 tracking-widest">Expected Total</p>
                <p className="text-2xl font-bold">{formatCurrency(expectedTotal)}</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-foreground/70">Agent Share</span>
                  <span className="font-bold text-accent">{formatCurrency(agentShare)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-foreground/70">Referral Share</span>
                  <span className="font-bold text-blue-400">{formatCurrency(referralShare)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-sm text-primary-foreground/70">Net Company Share</span>
                  <span className="font-bold text-white">{formatCurrency(expectedTotal - agentShare - referralShare)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase font-bold text-primary-foreground/40 tracking-widest mb-3">Actual Final Payouts</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-primary-foreground/60">Final Agent Payout:</span>
                    <span className="font-bold">{formatCurrency(finalAgentPayout)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-primary-foreground/60">Final Referral Payout:</span>
                    <span className="font-bold">{formatCurrency(finalReferralPayout)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
