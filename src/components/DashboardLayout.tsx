import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Plus, 
  Home,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { NewProjectModal } from "./NewProjectModal";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, role } = useCurrentUser();
  const { signOut } = useAuthActions();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      roles: ["admin", "agent", "viewer"],
    },
    {
      id: "projects",
      label: "Projects",
      path: "/projects",
      icon: Briefcase,
      roles: ["admin", "agent", "viewer"],
    },
    {
      id: "agents",
      label: "Agents",
      path: "/agents",
      icon: Users,
      roles: ["admin", "agent", "viewer"],
    },
    {
      id: "settings",
      label: "Settings",
      path: "/settings",
      icon: Settings,
      roles: ["admin", "agent", "viewer"],
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    !role || item.roles.includes(role as string)
  );

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const currentPage = navItems.find(item => 
    item.path === location.pathname || 
    (item.path !== "/" && location.pathname.startsWith(item.path))
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 border-r border-border/10`}>
        {/* Logo */}
        <div className="h-20 px-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#05f240] to-[#04d638] rounded-xl flex items-center justify-center shadow-lg shadow-[#05f240]/25">
              <Home className="w-6 h-6 text-sidebar" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Max Mortgage</h1>
              <p className="text-[10px] text-sidebar-foreground/80 uppercase tracking-widest">Management System</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-sidebar-foreground hover:bg-white/10" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto mt-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = currentPage?.id === item.id;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                      ? "bg-accent/10 text-accent border-l-4 border-accent -ml-px"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-accent" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/10">
            <Avatar className="w-10 h-10 rounded-xl border border-white/20">
              <AvatarImage src={user?.image} />
              <AvatarFallback className="bg-accent text-sidebar font-bold">
                {getInitials(user?.name || user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-sidebar-foreground/80 uppercase tracking-wider">{role || "Role"}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/10 h-8 w-8"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-4 lg:px-8 h-20 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">{currentPage?.label || "Dashboard"}</h1>
              <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search */}
            <div className="hidden md:relative md:block">
              <Input
                placeholder="Search projects..."
                className="w-64 pl-10 bg-muted border-border rounded-xl text-sm focus:ring-accent/20 focus:border-accent transition-all"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative bg-muted text-muted-foreground rounded-xl hover:bg-muted/80">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
            </Button>

            {/* Quick Add */}
            {role !== "viewer" && (
              <Button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl gap-2 shadow-lg shadow-accent/20 transition-all border-none"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

      <NewProjectModal 
        isOpen={isNewProjectModalOpen} 
        onOpenChange={setIsNewProjectModalOpen} 
      />
    </div>
  );
}
