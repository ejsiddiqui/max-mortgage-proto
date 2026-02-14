import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { formatDate, calculateDuration } from "@/lib/utils";
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calendar,
  AlertCircle,
  Edit2
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface TimelineTabProps {
  project: any;
}

export default function TimelineTab({ project }: TimelineTabProps) {
  const { role } = useCurrentUser();
  const isAdmin = role === "admin";
  const updateMilestones = useMutation(api.projects.updateMilestones);

  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [editDate, setEditDate] = useState("");

  const milestones = [
    { key: "wipStartedAt", label: "T1", name: "Speed to Start", from: project._creationTime, to: project.wipStartedAt, desc: "Time taken to start document collection." },
    { key: "docsCompletedAt", label: "T2", name: "Doc Collection", from: project.wipStartedAt, to: project.docsCompletedAt, desc: "Time taken to collect all required documents." },
    { key: "submittedAt", label: "T3", name: "Prep & Submit", from: project.docsCompletedAt, to: project.submittedAt, desc: "Preparation and final submission to bank." },
    { key: "folAt", label: "T4", name: "Bank Processing", from: project.submittedAt, to: project.folAt, desc: "Time taken by bank to issue FOL." },
    { key: "disbursedAt", label: "T5", name: "FOL to Disbursed", from: project.folAt, to: project.disbursedAt, desc: "Final closure and loan disbursement." },
  ];

  const totalDuration = calculateDuration(project._creationTime, project.disbursedAt || project.closedAt || Date.now(), project.pausedDays || 0);

  const handleEditClick = (m: any) => {
    if (!isAdmin) return;
    setEditingMilestone(m);
    if (m.to) {
      setEditDate(new Date(m.to).toISOString().split('T')[0]);
    } else {
      setEditDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleSaveMilestone = async () => {
    try {
      const timestamp = new Date(editDate).getTime();
      await updateMilestones({
        id: project._id,
        [editingMilestone.key]: timestamp
      });
      toast.success("Milestone updated");
      setEditingMilestone(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Processing Timeline</h3>
          <p className="text-sm text-muted-foreground">Track milestones and durations for this application.</p>
        </div>
        <div className="bg-card px-6 py-3 rounded-2xl border border-border shadow-sm text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Cycle Time</p>
          <p className="text-2xl font-bold text-primary">{totalDuration} Days</p>
        </div>
      </div>

      <div className="relative space-y-8 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-1 before:bg-muted">
        {milestones.map((m, index) => {
          const isReached = !!m.to;
          const isCurrent = !!m.from && !m.to;
          // For simplicity, we apply pausedDays to total duration and could distribute it, 
          // but usually it applies to the stage where it happened. 
          // For now, following "subtract from duration calculations".
          const duration = calculateDuration(m.from, m.to);

          return (
            <div key={m.label} className="relative z-10 flex gap-8 items-start group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-4 border-background shadow-sm transition-all duration-500 ${
                isReached ? "bg-emerald-500 text-white" : isCurrent ? "bg-primary text-white animate-pulse" : "bg-card text-muted-foreground border-border"
              }`}>
                {isReached ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold text-lg">{m.label}</span>}
              </div>

              <div className="flex-1 bg-card border border-border rounded-3xl p-6 shadow-sm group-hover:shadow-md transition-shadow relative">
                {isAdmin && isReached && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleEditClick(m)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{m.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                  </div>
                  <div className="text-right">
                    {isReached ? (
                      <div className="space-y-1">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">{duration} Days</Badge>
                        <p className="text-[10px] text-muted-foreground font-medium">{formatDate(m.to)}</p>
                      </div>
                    ) : isCurrent ? (
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-bold animate-pulse">In Progress</Badge>
                        <p className="text-[10px] text-muted-foreground font-medium">Started {formatDate(m.from)}</p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground/30 border-border font-bold">Pending</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="rounded-3xl border-border bg-blue-500/10 border-dashed">
        <CardContent className="p-6 flex items-center gap-4 text-blue-600">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm font-medium">
            Timeline durations exclude periods when the project was set to "On Hold" ({project.pausedDays || 0} days). 
            Total cycle time is calculated from the creation date.
          </p>
        </CardContent>
      </Card>

      {/* Edit Milestone Modal */}
      <Dialog open={!!editingMilestone} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit Milestone Date</DialogTitle>
            <DialogDescription>
              Manually adjust the date for {editingMilestone?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Milestone Date</Label>
              <Input 
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMilestone(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSaveMilestone} className="rounded-xl px-8 bg-primary">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
