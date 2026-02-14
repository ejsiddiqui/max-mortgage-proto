import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Briefcase, 
  FileText, 
  DollarSign, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
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
import OverviewTab from "./projects/OverviewTab";
import DocumentsTab from "./projects/DocumentsTab";
import CommissionTab from "./projects/CommissionTab";
import TimelineTab from "./projects/TimelineTab";
import { STAGES, STAGE_ORDER } from "@/lib/constants";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { role } = useCurrentUser();
  const project = useQuery(api.projects.getById, { id: id as any });
  const updateProject = useMutation(api.projects.update);
  const changeStage = useMutation(api.projects.changeStage);
  
  const banks = useQuery(api.banks.list);
  const agents = useQuery(api.users.listAgents);
  const referrals = useQuery(api.referrals.list);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);
  
  const [folModalOpen, setFolModalOpen] = useState(false);
  const [closedModalOpen, setClosedModalOpen] = useState(false);
  const [folNotes, setFolNotes] = useState("");
  const [closedOutcome, setClosedOutcome] = useState<any>("approved");
  
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (project) {
      setFormData({
        clientName: project.clientName,
        clientEmail: project.clientEmail || "",
        clientPhone: project.clientPhone || "",
        borrowerType: project.borrowerType,
        businessType: project.businessType,
        bankId: project.bankId,
        referralCompanyId: project.referralCompanyId || "none",
        assignedAgentId: project.assignedAgentId,
        loanAmount: project.loanAmount,
        property: project.property || "",
        propertyProfile: project.propertyProfile,
        notes: project.notes || "",
      });
    }
  }, [project]);

  if (project === undefined) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded-lg"></div>
              <div className="h-4 w-32 bg-muted rounded-lg"></div>
            </div>
          </div>
          <div className="h-10 w-32 bg-muted rounded-xl"></div>
        </div>
        <div className="h-12 w-full max-w-md bg-muted rounded-2xl"></div>
        <div className="h-[600px] w-full bg-muted rounded-3xl"></div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground opacity-20" />
        <h3 className="text-xl font-bold text-foreground">Project not found</h3>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const stageInfo = STAGES.find(s => s.value === project.stage);
  const showCommissionTab = project.stage === "disbursed" || project.stage === "closed";

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.referralCompanyId === "none") delete payload.referralCompanyId;
      
      await updateProject({
        id: project._id,
        ...payload,
        loanAmount: Number(payload.loanAmount),
      });
      toast.success("Project updated successfully");
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update project");
    }
  };

  const handleStageChange = async (newStage: string) => {
    if (newStage === project.stage) return;
    
    if (newStage === "fol") {
      setFolModalOpen(true);
      return;
    }

    if (newStage === "closed") {
      setClosedModalOpen(true);
      return;
    }

    setIsChangingStage(true);
    try {
      await changeStage({ id: project._id, newStage: newStage as any });
      toast.success(`Moved to ${STAGES.find(s => s.value === newStage)?.label}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to change stage");
    } finally {
      setIsChangingStage(false);
    }
  };

  const handleFolSubmit = async () => {
    setIsChangingStage(true);
    try {
      await changeStage({ 
        id: project._id, 
        newStage: "fol", 
        metadata: { folNotes } 
      });
      toast.success("Project moved to FOL");
      setFolModalOpen(false);
      setFolNotes("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsChangingStage(false);
    }
  };

  const handleClosedSubmit = async () => {
    setIsChangingStage(true);
    try {
      await changeStage({ 
        id: project._id, 
        newStage: "closed", 
        metadata: { closedOutcome } 
      });
      toast.success("Project Closed");
      setClosedModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsChangingStage(false);
    }
  };

  const currentIndex = STAGE_ORDER.indexOf(project.stage as any);
  const nextStage = STAGE_ORDER[currentIndex + 1];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl bg-card border border-border shadow-sm">
            <Link to="/projects"><ArrowLeft className="w-5 h-5 text-muted-foreground" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">{project.clientName}</h2>
              
              {/* Stage Dropdown */}
              <Select 
                value={project.stage} 
                onValueChange={handleStageChange}
                disabled={isChangingStage || project.stage === "closed"}
              >
                <SelectTrigger className={`h-7 w-auto min-w-[120px] px-3 py-0 border-none shadow-none font-bold text-[11px] uppercase rounded-full ${getStageColor(stageInfo?.color)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  {STAGES.map((s) => {
                    const isNext = s.value === nextStage;
                    const isCurrent = s.value === project.stage;
                    const isDisabled = !isNext && !isCurrent;
                    
                    return (
                      <SelectItem 
                        key={s.value} 
                        value={s.value}
                        disabled={isDisabled}
                        className={`text-[11px] font-bold uppercase rounded-lg ${isDisabled ? "opacity-40 grayscale" : ""}`}
                      >
                        {s.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Badge variant="outline" className={`capitalize font-bold border-2 ${getStatusBorder(project.status)}`}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
              <span className="text-primary font-bold">{project.projectCode}</span>
              <span className="w-1 h-1 rounded-full bg-muted"></span>
              <span>Created on {new Date(project._creationTime).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {role !== "viewer" && (
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-xl gap-2 bg-primary text-primary-foreground border-none hover:bg-primary/90"
            >
              < Pencil className="w-4 h-4" />
              Edit Project
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border p-1.5 rounded-2xl h-auto flex w-full md:w-max">
          <TabsTrigger value="overview" className="flex-1 md:flex-none gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-primary/5 data-[state=active]:text-primary text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 md:flex-none gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-primary/5 data-[state=active]:text-primary text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Documents</span>
          </TabsTrigger>
          {showCommissionTab && (
            <TabsTrigger value="commission" className="flex-1 md:flex-none gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-primary/5 data-[state=active]:text-primary text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Commission</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="timeline" className="flex-1 md:flex-none gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-primary/5 data-[state=active]:text-primary text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Timeline</span>
          </TabsTrigger>
        </TabsList>

        <div className="min-h-[600px]">
          <TabsContent value="overview" className="mt-0 animate-in fade-in duration-300">
            <OverviewTab project={project} />
          </TabsContent>
          <TabsContent value="documents" className="mt-0 animate-in fade-in duration-300">
            <DocumentsTab project={project} />
          </TabsContent>
          <TabsContent value="commission" className="mt-0 animate-in fade-in duration-300">
            <CommissionTab project={project} />
          </TabsContent>
          <TabsContent value="timeline" className="mt-0 animate-in fade-in duration-300">
            <TimelineTab project={project} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Edit Project Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Edit Project Details</DialogTitle>
            <DialogDescription>Update the client or mortgage information for this application.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProject} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Client Information</h4>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Full Name *</Label>
                  <Input 
                    id="clientName" 
                    value={formData.clientName} 
                    onChange={e => setFormData({...formData, clientName: e.target.value})}
                    className="rounded-xl border-border bg-muted/30"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email Address</Label>
                  <Input 
                    id="clientEmail" 
                    type="email"
                    value={formData.clientEmail} 
                    onChange={e => setFormData({...formData, clientEmail: e.target.value})}
                    className="rounded-xl border-border bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone Number</Label>
                  <Input 
                    id="clientPhone" 
                    value={formData.clientPhone} 
                    onChange={e => setFormData({...formData, clientPhone: e.target.value})}
                    className="rounded-xl border-border bg-muted/30"
                  />
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Application Details</h4>
                <div className="space-y-2">
                  <Label>Borrower Type *</Label>
                  <Select value={formData.borrowerType} onValueChange={val => setFormData({...formData, borrowerType: val})}>
                    <SelectTrigger className="rounded-xl border-border bg-muted/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      <SelectItem value="salaried">Salaried</SelectItem>
                      <SelectItem value="self_employed">Self-Employed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Business Type *</Label>
                  <Select value={formData.businessType} onValueChange={val => setFormData({...formData, businessType: val})}>
                    <SelectTrigger className="rounded-xl border-border bg-muted/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      <SelectItem value="buyout">Buyout</SelectItem>
                      <SelectItem value="equity_release">Equity Release</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount (AED) *</Label>
                  <Input 
                    id="loanAmount" 
                    type="number"
                    value={formData.loanAmount} 
                    onChange={e => setFormData({...formData, loanAmount: e.target.value})}
                    className="rounded-xl border-border bg-muted/30"
                    required 
                  />
                </div>
              </div>

              {/* Assignments */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Bank, Agent & Referral</h4>
                <div className="space-y-2">
                  <Label>Preferred Bank *</Label>
                  <Select value={formData.bankId} onValueChange={val => setFormData({...formData, bankId: val})}>
                    <SelectTrigger className="rounded-xl border-border bg-muted/30">
                      <SelectValue placeholder="Select a bank" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      {banks?.map(b => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned Agent *</Label>
                  <Select 
                    value={formData.assignedAgentId} 
                    onValueChange={val => setFormData({...formData, assignedAgentId: val})}
                    disabled={role !== "admin"}
                  >
                    <SelectTrigger className="rounded-xl border-border bg-muted/30">
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      {agents?.map(a => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {role !== "admin" && <p className="text-[10px] text-muted-foreground italic">Only admins can reassign projects.</p>}
                </div>
                <div className="space-y-2">
                  <Label>Referral Company</Label>
                  <Select value={formData.referralCompanyId} onValueChange={val => setFormData({...formData, referralCompanyId: val})}>
                    <SelectTrigger className="rounded-xl border-border bg-muted/30">
                      <SelectValue placeholder="No referral" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      <SelectItem value="none">None (Direct)</SelectItem>
                      {referrals?.map(r => <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Property Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Property Information</h4>
                <div className="space-y-2">
                  <Label>Property Profile *</Label>
                  <Select value={formData.propertyProfile} onValueChange={val => setFormData({...formData, propertyProfile: val})}>
                    <SelectTrigger className="rounded-xl border-border bg-muted/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      <SelectItem value="Building">Building</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property">Property Details</Label>
                  <Input 
                    id="property" 
                    value={formData.property} 
                    onChange={e => setFormData({...formData, property: e.target.value})}
                    placeholder="e.g. Unit 1204, Burj Vista"
                    className="rounded-xl border-border bg-muted/30"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea 
                id="notes" 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Enter any additional details..."
                className="rounded-xl border-border bg-muted/30 min-h-[100px]"
              />
            </div>

            <DialogFooter className="pt-6 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl border-border">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl px-10 gap-2 bg-primary text-primary-foreground border-none">
                <Save className="w-4 h-4" /> Update Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FOL Notes Modal */}
      <Dialog open={folModalOpen} onOpenChange={setFolModalOpen}>
        <DialogContent className="rounded-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>Facility Offer Letter (FOL) Notes</DialogTitle>
            <DialogDescription>
              Enter any conditions or requirements mentioned in the bank's offer letter.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="e.g. Subject to original title deed submission..."
              value={folNotes}
              onChange={e => setFolNotes(e.target.value)}
              className="rounded-xl min-h-[120px] border-border bg-muted/30"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFolModalOpen(false)} className="rounded-xl border-border">Cancel</Button>
            <Button onClick={handleFolSubmit} className="rounded-xl px-8 bg-primary border-none">Confirm FOL</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Closed Outcome Modal */}
      <Dialog open={closedModalOpen} onOpenChange={setClosedModalOpen}>
        <DialogContent className="rounded-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>Close Project</DialogTitle>
            <DialogDescription>
              Select the final outcome for this mortgage application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Outcome *</Label>
              <Select value={closedOutcome} onValueChange={setClosedOutcome}>
                <SelectTrigger className="rounded-xl border-border bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="disbursed">Successfully Disbursed</SelectItem>
                  <SelectItem value="approved">Approved (but not disbursed)</SelectItem>
                  <SelectItem value="rejected">Rejected by Bank</SelectItem>
                  <SelectItem value="cancelled">Cancelled by Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setClosedModalOpen(false)} className="rounded-xl border-border">Cancel</Button>
            <Button onClick={handleClosedSubmit} className="rounded-xl px-8 bg-primary border-none">Close Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const getStageColor = (color?: string) => {
  switch (color) {
    case "blue": return "bg-blue-500/10 text-blue-600";
    case "indigo": return "bg-indigo-500/10 text-indigo-600";
    case "purple": return "bg-purple-500/10 text-purple-600";
    case "cyan": return "bg-cyan-500/10 text-cyan-600";
    case "orange": return "bg-orange-500/10 text-orange-600";
    case "emerald": return "bg-emerald-500/10 text-emerald-600";
    default: return "bg-muted text-muted-foreground";
  }
};

const getStatusBorder = (status: string) => {
  switch (status) {
    case "open": return "border-blue-200 text-blue-700";
    case "active": return "border-emerald-200 text-emerald-700";
    case "on_hold": return "border-amber-200 text-amber-700";
    case "disbursed": return "border-blue-200 text-blue-700";
    default: return "border-border text-muted-foreground";
  }
};
