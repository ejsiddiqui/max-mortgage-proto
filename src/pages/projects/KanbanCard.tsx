import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Building2, User, Clock, CheckCircle2 } from "lucide-react";

interface KanbanCardProps {
  project: any;
}

export function KanbanCard({ project }: KanbanCardProps) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project._id,
    disabled: project.status === "on_hold",
    data: project,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : project.status === "on_hold" ? 0.6 : 1,
    cursor: project.status === "on_hold" ? "not-allowed" : "grab",
  };

  const daysInStage = Math.floor((Date.now() - (project.wipStartedAt || project._creationTime)) / (1000 * 60 * 60 * 24));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => navigate(`/projects/${project._id}`)}
      className={`bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group ${
        isDragging ? "ring-2 ring-primary z-50" : ""
      } ${project.status === "on_hold" ? "bg-muted border-dashed opacity-70" : ""}`}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{project.projectCode}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize border-border">
            {project.borrowerType.replace("_", " ")}
          </Badge>
        </div>
        
        <h4 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors truncate">
          {project.clientName}
        </h4>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="w-3 h-3" />
            <span className="truncate">{project.bankName || "No Bank"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="truncate">{project.agentName || "Unassigned"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="font-bold text-foreground">{formatCurrency(project.loanAmount)}</span>
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Clock className="w-3 h-3" />
            {daysInStage}d
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-full h-1.5 rounded-full bg-muted overflow-hidden`}>
            <div 
              className={`h-full rounded-full ${
                project.status === "on_hold" ? "bg-amber-400" : 
                project.status === "disbursed" ? "bg-blue-500" : "bg-emerald-500"
              }`} 
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
