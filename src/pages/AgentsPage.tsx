import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  CheckCircle2, 
  LayoutGrid, 
  List as ListIcon,
  TrendingUp
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AgentsPage() {
  const { role, user: currentUser } = useCurrentUser();
  const agents = useQuery(api.users.listAgents);
  const projects = useQuery(api.projects.list, {});
  
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredAgents = agents?.filter(a => {
    // Role check: Agents see only themselves
    if (role === "agent" && a._id !== currentUser?._id) return false;
    
    const term = search.toLowerCase();
    return a.name?.toLowerCase().includes(term) || a.email?.toLowerCase().includes(term);
  });

  if (agents === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 w-96 bg-muted rounded-xl"></div>
          <div className="h-10 w-32 bg-muted rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-muted rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const getAgentMetrics = (agentId: string) => {
    const agentProjects = projects?.filter((p: any) => p.assignedAgentId === agentId) || [];
    const active = agentProjects.filter((p: any) => p.status !== "closed" && p.status !== "disbursed").length;
    const closed = agentProjects.filter((p: any) => p.stage === "closed" || p.stage === "disbursed").length;
    const pipelineTotal = agentProjects
      .filter((p: any) => p.status !== "closed")
      .reduce((sum: number, p: any) => sum + p.loanAmount, 0);
    
    return { active, closed, pipelineTotal };
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search agents by name or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-xl bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
          <Button 
            variant={viewMode === "grid" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("grid")}
            className={`rounded-lg h-8 px-3 ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button 
            variant={viewMode === "table" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("table")}
            className={`rounded-lg h-8 px-3 ${viewMode === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <ListIcon className="w-4 h-4 mr-2" />
            Table
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents?.map((agent) => {
            const metrics = getAgentMetrics(agent._id);
            return (
              <Card key={agent._id} className="rounded-3xl border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16 rounded-2xl border-2 border-border shadow-sm">
                        <AvatarImage src={agent.image} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                          {getInitials(agent.name || agent.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{agent.name || "Unnamed Agent"}</h3>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{agent.region || "Dubai, UAE"}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3">
                      {agent.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-muted p-3 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Active</p>
                      <p className="text-xl font-bold text-foreground">{metrics.active}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Closed</p>
                      <p className="text-xl font-bold text-foreground">{metrics.closed}</p>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-2xl text-center border border-primary/10">
                      <p className="text-[10px] font-bold text-primary/60 uppercase">Pipeline</p>
                      <p className="text-sm font-bold text-primary truncate">{formatCurrency(metrics.pipelineTotal)}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Mail className="w-4 h-4 text-muted-foreground/70" />
                      </div>
                      <span className="truncate">{agent.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Phone className="w-4 h-4 text-muted-foreground/70" />
                      </div>
                      <span>{agent.phone || "+971 -- --- ----"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 pl-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Agent</th>
                <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active</th>
                <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Closed</th>
                <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Pipeline Total</th>
                <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Region</th>
                <th className="p-4 pr-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAgents?.map((agent) => {
                const metrics = getAgentMetrics(agent._id);
                return (
                  <tr key={agent._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 rounded-xl border border-border">
                          <AvatarImage src={agent.image} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {getInitials(agent.name || agent.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-foreground">{agent.name || "Unnamed Agent"}</p>
                          <p className="text-[10px] text-muted-foreground">{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-foreground">{metrics.active}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-foreground">{metrics.closed}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-bold text-primary">{formatCurrency(metrics.pipelineTotal)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{agent.region || "Dubai"}</span>
                    </td>
                    <td className="p-4 pr-6">
                      <Badge className={agent.isActive !== false ? "bg-emerald-500/10 text-emerald-600 border-none" : "bg-muted text-muted-foreground border-none"}>
                        {agent.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredAgents?.length === 0 && (
        <div className="py-20 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
          <h3 className="text-xl font-bold text-foreground">No agents found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}
