import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Pencil, Power, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function BanksTab() {
  const banks = useQuery(api.banks.list);
  const createBank = useMutation(api.banks.create);
  const updateBank = useMutation(api.banks.update);
  const removeBank = useMutation(api.banks.remove);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [deletingBank, setDeletingBank] = useState<any>(null);
  const [togglingBank, setTogglingBank] = useState<any>(null);

  const [formData, setFormData] = useState({ name: "", commissionRate: 0, isActive: true });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBank(formData);
      toast.success("Bank added successfully");
      setIsAddModalOpen(false);
      setFormData({ name: "", commissionRate: 0, isActive: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to add bank");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBank({ id: editingBank._id, ...formData });
      toast.success("Bank updated successfully");
      setEditingBank(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update bank");
    }
  };

  const handleDelete = async () => {
    try {
      await removeBank({ id: deletingBank._id });
      toast.success("Bank deleted successfully");
      setDeletingBank(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete bank");
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateBank({ id: togglingBank._id, isActive: !togglingBank.isActive });
      toast.success(`Bank ${togglingBank.isActive ? 'deactivated' : 'activated'} successfully`);
      setTogglingBank(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update bank status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-foreground">Banks</h3>
          <p className="text-sm text-muted-foreground font-medium">Manage mortgage lenders and their default commission rates.</p>
        </div>
        <Button 
          onClick={() => { setFormData({ name: "", commissionRate: 0, isActive: true }); setIsAddModalOpen(true); }}
          className="rounded-xl gap-2 border-none"
        >
          <Plus className="w-4 h-4" />
          Add Bank
        </Button>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-semibold text-muted-foreground">Bank Name</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Commission Rate</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banks?.map((bank) => (
              <TableRow key={bank._id} className="hover:bg-muted/30 border-border">
                <TableCell className="font-medium text-foreground">{bank.name}</TableCell>
                <TableCell className="text-foreground">{bank.commissionRate}%</TableCell>
                <TableCell>
                  <Badge variant={bank.isActive ? "default" : "secondary"} className={bank.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground"}>
                    {bank.isActive ? "Active" : "Inactive"}
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
                        onClick={() => { setEditingBank(bank); setFormData({ name: bank.name, commissionRate: bank.commissionRate, isActive: bank.isActive }); }}
                        className="gap-2 rounded-lg cursor-pointer focus:bg-muted"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setTogglingBank(bank)}
                        className="gap-2 rounded-lg cursor-pointer focus:bg-muted"
                      >
                        <Power className="w-4 h-4" /> {bank.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem 
                        onClick={() => setDeletingBank(bank)}
                        className="gap-2 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!banks?.length && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No banks found. Add your first bank to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || !!editingBank} onOpenChange={(open) => { if (!open) { setIsAddModalOpen(false); setEditingBank(null); } }}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingBank ? "Edit Bank" : "Add New Bank"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={editingBank ? handleEdit : handleAdd} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input 
                id="bankName" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Emirates NBD" 
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Commission Rate (%)</Label>
              <Input 
                id="rate" 
                type="number" 
                step="0.01"
                value={formData.commissionRate} 
                onChange={e => setFormData({...formData, commissionRate: parseFloat(e.target.value)})}
                placeholder="1.5" 
                className="rounded-xl"
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setEditingBank(null); }} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl px-8">
                {editingBank ? "Update Bank" : "Add Bank"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate/Activate Confirmation */}
      <AlertDialog open={!!togglingBank} onOpenChange={(open) => { if (!open) setTogglingBank(null); }}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{togglingBank?.isActive ? 'Deactivate' : 'Activate'} {togglingBank?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {togglingBank?.isActive 
                ? "Deactivating this bank will hide it from new project selections. Existing projects will not be affected."
                : "Activating this bank will make it available for new project selections."
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
      <AlertDialog open={!!deletingBank} onOpenChange={(open) => { if (!open) setDeletingBank(null); }}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete {deletingBank?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You can only delete banks that are not currently referenced by any projects.
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
