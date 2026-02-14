import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  PauseCircle, 
  PlayCircle, 
  XCircle, 
  History,
  ShieldAlert,
  Edit
} from "lucide-react";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BORROWER_TYPES, BUSINESS_TYPES, PROPERTY_PROFILES } from "@/lib/constants";

interface OverviewTabProps {
  project: any;
}

export default function OverviewTab({ project }: OverviewTabProps) {
  const { user, role } = useCurrentUser();
  
  const changeStatus = useMutation(api.projects.changeStatus);
  const logs = useQuery(api.auditLog.listByProject, { projectId: project._id, limit: 5 });
  
  const [isOnHoldModalOpen, setIsOnHoldModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [onHoldReason, setOnHoldReason] = useState("");
  const [closedOutcome, setClosedOutcome] = useState<any>("approved");

  const changeStage = useMutation(api.projects.changeStage);

  const handleToggleStatus = async () => {
    if (project.status === "on_hold") {
      try {
        await changeStatus({ id: project._id, newStatus: "active" });
        toast.success("Project reactivated");
      } catch (error: any) {
        toast.error(error.message);
      }
    } else {
      setIsOnHoldModalOpen(true);
    }
  };

  const handleOnHoldSubmit = async () => {
    try {
      await changeStatus({ id: project._id, newStatus: "on_hold", reason: onHoldReason });
      toast.success("Project put on hold");
      setIsOnHoldModalOpen(false);
      setOnHoldReason("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Note: Project closing logic is still here as it's a valid status control
  const handleCloseSubmit = async () => {
    try {
      await changeStage({ 
        id: project._id, 
        newStage: "closed", 
        metadata: { closedOutcome } 
      });
      toast.success("Project closed");
      setIsCloseModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Meta Info Grid */}
        <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <CardTitle className="text-lg font-bold text-foreground">Application Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Borrower Type</span>
                <Badge variant="outline" className="capitalize border-border">{project.borrowerType.replace("_", " ")}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Business Type</span>
                <span className="font-bold text-foreground capitalize">{project.businessType.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Assigned Bank</span>
                <div className="flex items-center gap-2 font-bold text-primary">
                  <Building2 className="w-4 h-4" />
                  {project.bankName}
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Referral Company</span>
                <span className="font-bold text-foreground">{project.referralName || "None"}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Property Profile</span>
                <span className="font-bold text-foreground">{project.propertyProfile}</span>
              </div>
              <div className="flex justify-between items-start py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Property Details</span>
                <span className="font-bold text-foreground text-right max-w-[180px]">{project.property || "Not specified"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground text-sm">Loan Amount</span>
                <span className="font-bold text-xl text-primary">{formatCurrency(project.loanAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Overview Grid */}
        <Card className="rounded-3xl border-border shadow-sm overflow-hidden bg-card">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <CardTitle className="text-lg font-bold text-foreground">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">LTV Ratio</p>
                <p className="text-lg font-bold text-foreground">{project.ltv || "-"}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Interest Rate</p>
                <p className="text-lg font-bold text-foreground">{project.interestRate || "-"}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Loan Term</p>
                <p className="text-lg font-bold text-foreground">{project.termYears || "-"} Years</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Monthly Payment</p>
                <p className="text-lg font-bold text-primary">{project.monthlyPayment ? formatCurrency(project.monthlyPayment) : "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-3xl border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="bg-muted/50 border-b border-border/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-primary" /> Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm text-muted-foreground">{project.clientEmail || "No email provided"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm text-muted-foreground">{project.clientPhone || "No phone provided"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="bg-muted/50 border-b border-border/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <ShieldAlert className="w-4 h-4 text-primary" /> Assigned Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 rounded-xl border border-primary/10">
                  <AvatarImage src={project.agentImage} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    {project.agentName?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-foreground">{project.agentName}</p>
                  <p className="text-xs text-muted-foreground">Case Manager</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Status & Activity */}
      <div className="space-y-6">
        {/* Status Controls */}
        <Card className="rounded-3xl border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Work Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-2xl border-2 flex flex-col gap-2 ${
              project.status === "on_hold" ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold capitalize text-foreground">{project.status.replace("_", " ")}</span>
                {project.status === "on_hold" ? <PauseCircle className="text-amber-500 w-5 h-5" /> : <PlayCircle className="text-emerald-500 w-5 h-5" />}
              </div>
              {project.status === "on_hold" && (
                <p className="text-xs text-amber-600 dark:text-amber-400 italic">" {project.onHoldReason} "</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={handleToggleStatus}
                disabled={project.status === "disbursed" || project.stage === "closed"}
                className="rounded-xl justify-start gap-3 h-12 border-border hover:bg-muted"
              >
                {project.status === "on_hold" ? (
                  <><PlayCircle className="w-5 h-5 text-emerald-500" /> Activate Project</>
                ) : (
                  <><PauseCircle className="w-5 h-5 text-amber-500" /> Put On Hold</>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCloseModalOpen(true)}
                disabled={project.stage === "closed"}
                className="rounded-xl justify-start gap-3 h-12 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                <XCircle className="w-5 h-5" /> Close Project
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-3xl border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <History className="w-5 h-5 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
              {logs?.map((log) => (
                <div key={log._id} className="flex gap-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-card border-2 border-border/50 flex items-center justify-center shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-foreground">
                      <span className="font-bold">{log.performerName}</span> 
                      <span className="mx-1 text-muted-foreground">{log.action.replace("_", " ")}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelativeTime(log.timestamp)}</p>
                  </div>
                </div>
              ))}
              {logs?.length === 0 && (
                <div className="py-4 text-center text-muted-foreground italic text-xs">No activity yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* On Hold Reason Modal */}
      <Dialog open={isOnHoldModalOpen} onOpenChange={setIsOnHoldModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Put Project On Hold</DialogTitle>
            <DialogDescription>
              Please provide a reason why this mortgage application is being paused.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="e.g. Waiting for client to provide latest salary certificate..."
              value={onHoldReason}
              onChange={e => setOnHoldReason(e.target.value)}
              className="rounded-xl min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOnHoldModalOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleOnHoldSubmit} className="rounded-xl px-8 bg-primary">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Project Modal */}
      <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
        <DialogContent className="rounded-3xl">
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
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="disbursed">Successfully Disbursed</SelectItem>
                  <SelectItem value="approved">Approved (but not disbursed)</SelectItem>
                  <SelectItem value="rejected">Rejected by Bank</SelectItem>
                  <SelectItem value="cancelled">Cancelled by Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseModalOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCloseSubmit} className="rounded-xl px-8 bg-primary">Close Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
