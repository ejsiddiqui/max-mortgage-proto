import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, calculateDuration } from "@/lib/utils";
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calendar,
  AlertCircle
} from "lucide-react";

interface TimelineTabProps {
  project: any;
}

export default function TimelineTab({ project }: TimelineTabProps) {
  const milestones = [
    { label: "T1", name: "Speed to Start", from: project._creationTime, to: project.wipStartedAt, desc: "Time taken to start document collection." },
    { label: "T2", name: "Doc Collection", from: project.wipStartedAt, to: project.docsCompletedAt, desc: "Time taken to collect all required documents." },
    { label: "T3", name: "Prep & Submit", from: project.docsCompletedAt, to: project.submittedAt, desc: "Preparation and final submission to bank." },
    { label: "T4", name: "Bank Processing", from: project.submittedAt, to: project.folAt, desc: "Time taken by bank to issue FOL." },
    { label: "T5", name: "FOL to Disbursed", from: project.folAt, to: project.disbursedAt, desc: "Final closure and loan disbursement." },
  ];

  const totalDuration = calculateDuration(project._creationTime, project.disbursedAt || project.closedAt || Date.now());

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
          const duration = calculateDuration(m.from, m.to);

          return (
            <div key={m.label} className="relative z-10 flex gap-8 items-start group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-4 border-background shadow-sm transition-all duration-500 ${
                isReached ? "bg-emerald-500 text-white" : isCurrent ? "bg-primary text-white animate-pulse" : "bg-card text-muted-foreground border-border"
              }`}>
                {isReached ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold text-lg">{m.label}</span>}
              </div>

              <div className="flex-1 bg-card border border-border rounded-3xl p-6 shadow-sm group-hover:shadow-md transition-shadow">
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
            Timeline durations exclude periods when the project was set to "On Hold". 
            Total cycle time is calculated from the creation date.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
