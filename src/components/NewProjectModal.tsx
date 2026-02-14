import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BORROWER_TYPES, BUSINESS_TYPES, PROPERTY_PROFILES } from "@/lib/constants";

interface NewProjectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectModal({ isOpen, onOpenChange }: NewProjectModalProps) {
  const navigate = useNavigate();
  const banks = useQuery(api.banks.list, { onlyActive: true });
  const referrals = useQuery(api.referrals.list, { onlyActive: true });
  const agents = useQuery(api.users.listAgents, { onlyActive: true });
  const createProject = useMutation(api.projects.create);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    borrowerType: "salaried" as "salaried" | "self_employed",
    businessType: "buyout" as "buyout" | "equity_release",
    bankId: "" as any,
    referralCompanyId: undefined as any,
    assignedAgentId: "" as any,
    loanAmount: 0,
    property: "",
    propertyProfile: "Building" as "Land" | "Building",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bankId || !formData.assignedAgentId) {
      toast.error("Please select a bank and an agent");
      return;
    }

    setIsLoading(true);
    try {
      const projectId = await createProject(formData);
      toast.success("Project created successfully");
      onOpenChange(false);
      navigate(`/projects/${projectId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">New Project</DialogTitle>
          <DialogDescription>Enter the meta information for the new mortgage application.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Info */}
            <div className="space-y-4 md:col-span-2">
              <h4 className="font-semibold text-slate-700 border-b pb-1">Client Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Full Name *</Label>
                  <Input 
                    id="clientName" 
                    required 
                    value={formData.clientName}
                    onChange={e => setFormData({...formData, clientName: e.target.value})}
                    placeholder="e.g. Michael Thompson"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email Address</Label>
                  <Input 
                    id="clientEmail" 
                    type="email"
                    value={formData.clientEmail}
                    onChange={e => setFormData({...formData, clientEmail: e.target.value})}
                    placeholder="email@example.com"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone Number</Label>
                  <Input 
                    id="clientPhone" 
                    value={formData.clientPhone}
                    onChange={e => setFormData({...formData, clientPhone: e.target.value})}
                    placeholder="+971 -- --- ----"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Application Meta */}
            <div className="space-y-4 md:col-span-2">
              <h4 className="font-semibold text-slate-700 border-b pb-1">Application Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Borrower Type *</Label>
                  <Select 
                    value={formData.borrowerType} 
                    onValueChange={(val: any) => setFormData({...formData, borrowerType: val})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {BORROWER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Business Type *</Label>
                  <Select 
                    value={formData.businessType} 
                    onValueChange={(val: any) => setFormData({...formData, businessType: val})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {BUSINESS_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Property Profile *</Label>
                  <Select 
                    value={formData.propertyProfile} 
                    onValueChange={(val: any) => setFormData({...formData, propertyProfile: val})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {PROPERTY_PROFILES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Assignment & Loan */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700 border-b pb-1">Assignment</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Assigned Bank *</Label>
                  <Select 
                    value={formData.bankId} 
                    onValueChange={(val: any) => setFormData({...formData, bankId: val})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select Bank" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {banks?.map(b => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Referral Company</Label>
                  <Select 
                    value={formData.referralCompanyId} 
                    onValueChange={(val: any) => setFormData({...formData, referralCompanyId: val})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="No Referral" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">No Referral</SelectItem>
                      {referrals?.map(r => <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned Agent *</Label>
                  <Select 
                    value={formData.assignedAgentId} 
                    onValueChange={(val: any) => setFormData({...formData, assignedAgentId: val})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select Agent" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {agents?.map(a => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700 border-b pb-1">Loan Information</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount (AED) *</Label>
                  <Input 
                    id="loanAmount" 
                    type="number"
                    required 
                    value={formData.loanAmount}
                    onChange={e => setFormData({...formData, loanAmount: parseFloat(e.target.value)})}
                    placeholder="e.g. 2500000"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property">Property Address / Details</Label>
                  <Input 
                    id="property" 
                    value={formData.property}
                    onChange={e => setFormData({...formData, property: e.target.value})}
                    placeholder="e.g. Marina Gate 1, Apt 1502"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional information..."
                    className="rounded-xl min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl px-12 bg-primary">
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
