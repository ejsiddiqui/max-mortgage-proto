import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users, 
  Building2, 
  ArrowUpRight,
  Activity,
  Calendar,
  Layers
} from "lucide-react";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { STAGES } from "@/lib/constants";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, role } = useCurrentUser();
  const projects = useQuery(api.projects.list, {});
  const logs = useQuery(api.auditLog.listRecent, { limit: 5 });
  const agents = useQuery(api.users.listAgents);
  const referrals = useQuery(api.referrals.list);

  // Computed Stats
  const activeProjects = projects?.filter((p: any) => p.status !== "closed" && p.status !== "disbursed") || [];
  const disbursedProjects = projects?.filter((p: any) => p.stage === "disbursed" || (p.stage === "closed" && p.closedOutcome === "disbursed")) || [];
  
  const totalActiveValue = activeProjects.reduce((sum: number, p: any) => sum + p.loanAmount, 0);
  const totalDisbursedYTD = disbursedProjects.reduce((sum: number, p: any) => sum + p.loanAmount, 0);

  const propertyStats = activeProjects.reduce((acc: Record<string, { count: number, amount: number }>, p: any) => {
    const profile = p.propertyProfile === "Land" ? "Land" : "Building";
    if (!acc[profile]) {
      acc[profile] = { count: 0, amount: 0 };
    }
    acc[profile].count += 1;
    acc[profile].amount += p.loanAmount;
    return acc;
  }, { "Land": { count: 0, amount: 0 }, "Building": { count: 0, amount: 0 } });

  const totalPropertyCount = activeProjects.length || 1;
  const landPercent = Math.round((propertyStats["Land"].count / totalPropertyCount) * 100);
  const buildingPercent = 100 - landPercent;

  const stageCounts = STAGES.map(s => ({
    ...s,
    count: projects?.filter((p: any) => p.stage === s.value).length || 0
  }));

  const getStageColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 text-blue-700";
      case "indigo": return "bg-indigo-100 text-indigo-700";
      case "purple": return "bg-purple-100 text-purple-700";
      case "cyan": return "bg-cyan-100 text-cyan-700";
      case "orange": return "bg-orange-100 text-orange-700";
      case "emerald": return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Row 1 - Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Dashboard Greeting */}
        <Card className="rounded-3xl border-none bg-primary text-primary-foreground shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24 rotate-12" />
          </div>
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div>
              <p className="text-primary-foreground/70 text-sm font-medium">Welcome back,</p>
              <h2 className="text-2xl font-bold mt-1">{user?.name || "User"}</h2>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <p className="text-primary-foreground/60 text-xs">You have {activeProjects.length} active projects in your pipeline.</p>
              <Button asChild variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-none text-white rounded-xl h-10">
                <Link to="/projects">View Pipeline <ArrowUpRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* YTD Widget */}
        <Card className="rounded-3xl border-border shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground border-border">YTD Performance</Badge>
            </div>
            <p className="text-muted-foreground text-sm font-medium">Disbursed Amount</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalDisbursedYTD)}</h3>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span className="font-bold text-emerald-600">{disbursedProjects.length} Cases</span>
              <span className="text-muted-foreground">completed this year</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Widget */}
        <Card className="rounded-3xl border-border shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground border-border">Live Pipeline</Badge>
            </div>
            <p className="text-muted-foreground text-sm font-medium">Total Pipeline Value</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalActiveValue)}</h3>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span className="font-bold text-blue-600">{activeProjects.length} Active</span>
              <span className="text-muted-foreground">currently in progress</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Profile Widget */}
        <Card className="rounded-3xl border-border shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-accent flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground border-border">Portfolio Mix</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Land Stats */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-[#00e65a]"></div>
                  <span className="text-sm font-medium">Land</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {formatCurrency(propertyStats["Land"].amount)}
                </div>
                <div className="text-[11px] text-muted-foreground/60 font-medium">
                  {landPercent}% • {propertyStats["Land"].count} cases
                </div>
              </div>

              {/* Building Stats */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-[#ff9f0a]"></div>
                  <span className="text-sm font-medium">Building</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {formatCurrency(propertyStats["Building"].amount)}
                </div>
                <div className="text-[11px] text-muted-foreground/60 font-medium">
                  {buildingPercent}% • {propertyStats["Building"].count} cases
                </div>
              </div>
            </div>

            {/* Segmented Bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-muted/30 mt-4">
              <div 
                className="h-full bg-[#00e65a] transition-all duration-1000" 
                style={{ width: `${landPercent}%` }}
              ></div>
              <div 
                className="h-full bg-[#ff9f0a] transition-all duration-1000" 
                style={{ width: `${buildingPercent}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 - Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Active Projects Table */}
        <Card className="rounded-3xl border-border shadow-sm lg:col-span-2 bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-foreground">Recently Updated</CardTitle>
            <Button asChild variant="link" size="sm" className="text-primary font-semibold">
              <Link to="/projects/list">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.slice(0, 5).map((p: any) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
                      {p.projectCode.split("-")[1]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground truncate max-w-[100px] md:max-w-[150px]">{p.clientName}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{p.projectCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden xl:block">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(p.loanAmount)}</p>
                      <p className="text-[10px] text-muted-foreground">Loan Amount</p>
                    </div>
                    <Badge className={`capitalize text-[10px] font-bold ${getStageColor(STAGES.find(s => s.value === p.stage)?.color || "slate")}`}>
                      {p.stage.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
              {activeProjects.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No active projects found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stage Breakdown */}
        <Card className="rounded-3xl border-border shadow-sm bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Pipeline Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageCounts.map((s) => (
                <div key={s.value} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      s.color === "blue" ? "bg-blue-500" :
                      s.color === "indigo" ? "bg-indigo-500" :
                      s.color === "purple" ? "bg-purple-500" :
                      s.color === "cyan" ? "bg-cyan-500" :
                      s.color === "orange" ? "bg-orange-500" :
                      s.color === "emerald" ? "bg-emerald-500" : "bg-muted"
                    }`}></div>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">{s.label}</span>
                  </div>
                  <Badge variant="secondary" className="rounded-lg bg-muted text-muted-foreground font-bold">
                    {s.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Avg. Milestone Durations */}
        <Card className="rounded-3xl border-border shadow-sm bg-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Processing Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-border/50">
                <p className="text-3xl font-bold text-primary">19d</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Avg. Cycle Time</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "T1 - Start", value: "2d" },
                  { label: "T2 - Docs", value: "8d" },
                  { label: "T3 - Sub", value: "3d" },
                  { label: "T4 - Bank", value: "12d" },
                ].map((t) => (
                  <div key={t.label} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground truncate mr-2">{t.label}</span>
                    <span className="font-bold text-foreground">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 - Performance & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Performance */}
        <Card className="rounded-3xl border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-primary" /> Top Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {agents?.slice(0, 3).map((agent: any) => {
                const agentActiveValue = projects?.filter((p: any) => p.assignedAgentId === agent._id && p.status !== "closed").reduce((sum: number, p: any) => sum + p.loanAmount, 0) || 0;
                const agentDisbursedValue = projects?.filter((p: any) => p.assignedAgentId === agent._id && p.stage === "disbursed").reduce((sum: number, p: any) => sum + p.loanAmount, 0) || 0;
                
                return (
                  <div key={agent._id} className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 rounded-xl">
                      <AvatarImage src={agent.image} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {agent.name?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{agent.name}</p>
                      <div className="mt-1">
                        <p className="text-[10px] font-bold text-blue-600">{formatCurrency(agentActiveValue)} <span className="text-muted-foreground font-medium uppercase ml-1">Active</span></p>
                        <p className="text-[10px] font-bold text-emerald-600">{formatCurrency(agentDisbursedValue)} <span className="text-muted-foreground font-medium uppercase ml-1">Disbursed</span></p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Referral Agencies */}
        <Card className="rounded-3xl border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Building2 className="w-5 h-5 text-primary" /> Referral Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {referrals?.slice(0, 3).map((ref: any) => {
                const refActiveValue = projects?.filter((p: any) => p.referralCompanyId === ref._id && p.status !== "closed").reduce((sum: number, p: any) => sum + p.loanAmount, 0) || 0;
                
                return (
                  <div key={ref._id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary">
                      {ref.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{ref.name}</p>
                      <div className="mt-1">
                        <p className="text-[10px] font-bold text-blue-600">{formatCurrency(refActiveValue)} <span className="text-muted-foreground font-medium uppercase ml-1">Active Pipeline</span></p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-3xl border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Activity className="w-5 h-5 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
              {logs?.map((log: any) => (
                <div key={log._id} className="flex gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-card border-2 border-border/50 flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground">
                      <span className="font-bold">{log.performerName}</span> 
                      <span className="mx-1 text-muted-foreground">{log.action.replace("_", " ")}</span>
                      {log.projectCode && <span className="font-bold text-primary">#{log.projectCode}</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(log.timestamp)}</p>
                  </div>
                </div>
              ))}
              {logs?.length === 0 && (
                <div className="py-8 text-center text-muted-foreground italic text-xs">No activity yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
