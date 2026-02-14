import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { STAGES, STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Filter, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Briefcase } from "lucide-react";

export default function ProjectsListPage() {
  const [filters, setFilters] = useState({
    stage: "all",
    status: "all",
    search: "",
    agentId: "all",
    bankId: "all",
  });
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const projects = useQuery(api.projects.list, {
    stage: filters.stage === "all" ? undefined : filters.stage,
    status: filters.status === "all" ? undefined : filters.status,
    agentId: filters.agentId === "all" ? undefined : filters.agentId as any,
    bankId: filters.bankId === "all" ? undefined : filters.bankId as any,
    search: filters.search || undefined,
  });

  const agents = useQuery(api.users.listAgents);
  const banks = useQuery(api.banks.list);

  if (projects === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-3xl" />)}
        </div>
        <div className="h-20 w-full bg-muted rounded-2xl" />
        <div className="h-[500px] w-full bg-muted rounded-3xl" />
      </div>
    );
  }

  const stats = {
    totalValue: projects?.reduce((sum: number, p: any) => sum + p.loanAmount, 0) || 0,
    avgTicket: projects?.length ? (projects.reduce((sum: number, p: any) => sum + p.loanAmount, 0) / projects.length) : 0,
    activeCount: projects?.filter((p: any) => p.status !== "disbursed").length || 0,
  };

  const paginatedProjects = projects?.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil((projects?.length || 0) / pageSize);

  const getStageColor = (stage: string) => {
    const s = STAGES.find(s => s.value === stage);
    switch (s?.color) {
      case "blue": return "bg-blue-100 text-blue-700 border-blue-200";
      case "indigo": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "purple": return "bg-purple-100 text-purple-700 border-purple-200";
      case "cyan": return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "orange": return "bg-orange-100 text-orange-700 border-orange-200";
      case "emerald": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-700 border-blue-200";
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "on_hold": return "bg-amber-100 text-amber-700 border-amber-200";
      case "disbursed": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Pipeline Value</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Avg. Ticket Size</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.avgTicket)}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active Applications</p>
            <p className="text-2xl font-bold text-foreground">{stats.activeCount}</p>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by client or code..." 
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              className="pl-10 rounded-xl bg-muted border-border"
            />
          </div>
          <Select value={filters.stage} onValueChange={val => setFilters({...filters, stage: val})}>
            <SelectTrigger className="w-full md:w-40 rounded-xl bg-muted border-border">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Stages</SelectItem>
              {STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={val => setFilters({...filters, status: val})}>
            <SelectTrigger className="w-full md:w-40 rounded-xl bg-muted border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.agentId} onValueChange={val => setFilters({...filters, agentId: val})}>
            <SelectTrigger className="w-full md:w-40 rounded-xl bg-muted border-border">
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Agents</SelectItem>
              {agents?.map(a => <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.bankId} onValueChange={val => setFilters({...filters, bankId: val})}>
            <SelectTrigger className="w-full md:w-40 rounded-xl bg-muted border-border">
              <SelectValue placeholder="Bank" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Banks</SelectItem>
              {banks?.map(b => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
          <Link to="/projects/list" className="p-2 bg-card rounded-lg shadow-sm text-primary">
            <ListIcon className="w-4 h-4" />
          </Link>
          <Link to="/projects" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <LayoutGrid className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="font-semibold text-muted-foreground">Client Name</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Stage</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Agent</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Loan Amount</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Updated</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-right font-semibold text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProjects?.map((project: any) => (
              <TableRow key={project._id} className="hover:bg-muted/50 border-border">
                <TableCell>
                  <div className="font-semibold text-foreground">{project.clientName}</div>
                  <div className="text-xs text-muted-foreground">{project.projectCode}</div>
                </TableCell>
                <TableCell>
                  <Badge className={`capitalize font-medium ${getStageColor(project.stage)}`}>
                    {project.stage.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{project.agentName || "Unassigned"}</TableCell>
                <TableCell className="font-semibold text-foreground">{formatCurrency(project.loanAmount)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(project._creationTime)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[project.status] || 'bg-muted'}`}></div>
                    <span className="text-sm font-medium capitalize text-foreground">{project.status.replace("_", " ")}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link 
                    to={`/projects/${project._id}`}
                    className="text-primary font-semibold text-sm hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {!projects?.length && (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center border-border">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Briefcase className="w-12 h-12 opacity-20" />
                    <p>No projects found matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{Math.min((page - 1) * pageSize + 1, projects?.length || 0)}</span> to <span className="font-medium text-foreground">{Math.min(page * pageSize, projects?.length || 0)}</span> of <span className="font-medium text-foreground">{projects?.length || 0}</span> projects
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              className="rounded-lg h-8 px-2 border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button 
                  key={p}
                  variant={page === p ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setPage(p)}
                  className={`rounded-lg h-8 w-8 p-0 ${page === p ? "bg-primary text-primary-foreground border-none" : "border-border"}`}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === totalPages || totalPages === 0} 
              onClick={() => setPage(page + 1)}
              className="rounded-lg h-8 px-2 border-border"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  open: "bg-blue-500",
  active: "bg-emerald-500",
  on_hold: "bg-amber-500",
  disbursed: "bg-blue-500",
};
