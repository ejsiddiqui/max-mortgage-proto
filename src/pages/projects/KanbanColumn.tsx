import { useDroppable } from "@dnd-kit/core";
import { KanbanCard } from "./KanbanCard";
import { Badge } from "@/components/ui/badge";

interface KanbanColumnProps {
  id: string;
  label: string;
  projects: any[];
}

export function KanbanColumn({ id, label, projects }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col gap-4 w-72 flex-shrink-0">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-foreground/80">{label}</h3>
        <Badge variant="secondary" className="rounded-lg bg-muted text-muted-foreground border-none">
          {projects.length}
        </Badge>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex-1 bg-muted/30 rounded-3xl p-3 border-2 border-dashed border-transparent min-h-[500px] space-y-3 transition-colors"
      >
        {projects.map((project) => (
          <KanbanCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
}
