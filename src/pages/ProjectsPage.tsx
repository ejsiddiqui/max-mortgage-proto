import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverEvent,
  DragStartEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { KanbanColumn } from "./projects/KanbanColumn";
import { STAGES, STAGE_ORDER } from "@/lib/constants";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Search, Filter, LayoutGrid, List as ListIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProjectsPage() {
  const projects = useQuery(api.projects.list, {});
  const changeStage = useMutation(api.projects.changeStage);

  const [activeId, setActiveId] = useState<any>(null);
  const [folModalProject, setFolModalProject] = useState<any>(null);
  const [closedModalProject, setClosedModalProject] = useState<any>(null);
  const [folNotes, setFolNotes] = useState("");
  const [closedOutcome, setClosedOutcome] = useState<any>("approved");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const project = active.data.current;
    const newStage = over.id as string;

    if (project.stage === newStage) return;

    // Validate Forward-only & Next-only
    const currentIndex = STAGE_ORDER.indexOf(project.stage);
    const newIndex = STAGE_ORDER.indexOf(newStage as any);

    if (newIndex !== currentIndex + 1) {
      toast.warning("Restricted Stage Change", {
        description: "Projects can only be moved to the immediate next stage.",
      });
      return;
    }

    // Modal Prompts
    if (newStage === "fol") {
      setFolModalProject({ id: project._id, stage: newStage });
      return;
    }

    if (newStage === "closed") {
      setClosedModalProject({ id: project._id, stage: newStage });
      return;
    }

    try {
      await changeStage({ id: project._id, newStage: newStage as any });
      toast.success(`Moved to ${STAGES.find(s => s.value === newStage)?.label}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to move project");
    }
  };

  const handleFolSubmit = async () => {
    try {
      await changeStage({ 
        id: folModalProject.id, 
        newStage: folModalProject.stage, 
        metadata: { folNotes } 
      });
      toast.success("Project moved to FOL");
      setFolModalProject(null);
      setFolNotes("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleClosedSubmit = async () => {
    try {
      await changeStage({ 
        id: closedModalProject.id, 
        newStage: closedModalProject.stage, 
        metadata: { closedOutcome } 
      });
      toast.success("Project Closed");
      setClosedModalProject(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const groupedProjects = STAGES.reduce((acc, stage) => {
    acc[stage.value] = projects?.filter(p => p.stage === stage.value) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-10 rounded-xl bg-muted border-border" />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-border">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
          <Link to="/projects/list" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <ListIcon className="w-4 h-4" />
          </Link>
          <Link to="/projects" className="p-2 bg-card rounded-lg shadow-sm text-primary">
            <LayoutGrid className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-8">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 min-w-max h-full">
            {STAGES.map((stage) => (
              <KanbanColumn 
                key={stage.value} 
                id={stage.value} 
                label={stage.label} 
                projects={groupedProjects[stage.value] || []} 
              />
            ))}
          </div>
        </DndContext>
      </div>

      {/* FOL Notes Modal */}
      <Dialog open={!!folModalProject} onOpenChange={(open) => !open && setFolModalProject(null)}>
        <DialogContent className="rounded-3xl">
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
              className="rounded-xl min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolModalProject(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleFolSubmit} className="rounded-xl px-8 bg-primary">Confirm FOL</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Closed Outcome Modal */}
      <Dialog open={!!closedModalProject} onOpenChange={(open) => !open && setClosedModalProject(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Close Project</DialogTitle>
            <DialogDescription>
              Select the final outcome for this mortgage application.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome *</label>
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
            <Button variant="outline" onClick={() => setClosedModalProject(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleClosedSubmit} className="rounded-xl px-8 bg-primary">Close Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
