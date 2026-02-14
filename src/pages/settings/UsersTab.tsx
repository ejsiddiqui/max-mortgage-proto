import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Pencil, Power, Trash2, UserPlus } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UsersTab() {
  const { user: currentUser } = useCurrentUser();
  const users = useQuery(api.users.list);
  const createUser = useMutation(api.users.create);
  const updateUser = useMutation(api.users.update);
  const removeUser = useMutation(api.users.remove);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [togglingUser, setTogglingUser] = useState<any>(null);

  const [formData, setFormData] = useState({ 
    name: "", 
    email: "",
    role: "agent" as "admin" | "agent" | "viewer",
    isActive: true,
    commissionRate: 0,
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        commissionRate: formData.role === "agent" ? formData.commissionRate : undefined,
      });
      toast.success("User added successfully. They can now sign in using password reset flow or default password.");
      setIsAddModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to add user");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ id: editingUser._id, ...formData });
      toast.success("User updated successfully");
      setEditingUser(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "agent",
      isActive: true,
      commissionRate: 0,
    });
  };

  const handleDelete = async () => {
    try {
      await removeUser({ id: deletingUser._id });
      toast.success("User deleted successfully");
      setDeletingUser(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateUser({ id: togglingUser._id, isActive: !togglingUser.isActive });
      toast.success(`User ${togglingUser.isActive ? 'deactivated' : 'activated'} successfully`);
      setTogglingUser(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-foreground">User Management</h3>
          <p className="text-sm text-muted-foreground">Manage internal users, roles, and agent commission shares.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="rounded-xl gap-2 border-none bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-semibold text-muted-foreground">User</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Role</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Comm. Rate</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((u) => (
              <TableRow key={u._id} className="hover:bg-muted/30 border-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 rounded-lg border border-border">
                      <AvatarImage src={u.image} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                        {getInitials(u.name || u.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate text-foreground">{u.name || "Unnamed User"}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize border-border text-foreground">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground">
                  {u.role === "agent" ? `${u.commissionRate || 0}%` : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "default" : "secondary"} className={u.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground"}>
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl p-1 w-40 bg-card border-border">
                      <DropdownMenuItem 
                        onClick={() => { 
                          setEditingUser(u); 
                          setFormData({ 
                            name: u.name || "", 
                            role: u.role || "agent", 
                            isActive: u.isActive !== false, 
                            commissionRate: u.commissionRate || 0 
                          }); 
                        }}
                        className="gap-2 rounded-lg cursor-pointer focus:bg-muted"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setTogglingUser(u)}
                        disabled={u._id === currentUser?._id}
                        className="gap-2 rounded-lg cursor-pointer focus:bg-muted"
                      >
                        <Power className="w-4 h-4" /> {u.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem 
                        onClick={() => setDeletingUser(u)}
                        disabled={u._id === currentUser?._id}
                        className="gap-2 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
            <DialogDescription>Update user role and permissions.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Full Name</Label>
              <Input 
                id="userName" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userRole">System Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(val: any) => setFormData({...formData, role: val})}
              >
                <SelectTrigger id="userRole" className="rounded-xl">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.role === "agent" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="userRate">Default Commission Rate (%)</Label>
                <Input 
                  id="userRate" 
                  type="number"
                  value={formData.commissionRate} 
                  onChange={e => setFormData({...formData, commissionRate: parseInt(e.target.value)})}
                  className="rounded-xl"
                />
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl px-8">
                Update User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="rounded-3xl max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Add New User</DialogTitle>
            <DialogDescription>Create a new internal account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="addName">Full Name *</Label>
              <Input 
                id="addName" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. John Doe"
                className="rounded-xl border-border bg-muted/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addEmail">Email Address *</Label>
              <Input 
                id="addEmail" 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="user@maxmortgage.com"
                className="rounded-xl border-border bg-muted/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addUserRole">System Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(val: any) => setFormData({...formData, role: val})}
              >
                <SelectTrigger id="addUserRole" className="rounded-xl border-border bg-muted/30">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.role === "agent" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="addUserRate">Default Commission Rate (%)</Label>
                <Input 
                  id="addUserRate" 
                  type="number"
                  value={formData.commissionRate} 
                  onChange={e => setFormData({...formData, commissionRate: parseInt(e.target.value)})}
                  className="rounded-xl border-border bg-muted/30"
                />
              </div>
            )}

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl border-border">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl px-8 bg-primary border-none text-primary-foreground">
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toggling Confirmation */}
      <AlertDialog open={!!togglingUser} onOpenChange={(open) => { if (!open) setTogglingUser(null); }}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{togglingUser?.isActive ? 'Deactivate' : 'Activate'} {togglingUser?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {togglingUser?.isActive 
                ? "Deactivating this user will prevent them from logging in. You cannot deactivate the last active admin."
                : "Activating this user will allow them to log in to the system again."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive} className="rounded-xl bg-primary">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => { if (!open) setDeletingUser(null); }}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete {deletingUser?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You cannot delete yourself or the last active admin. 
              Users assigned to projects cannot be deleted; deactivate them instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
