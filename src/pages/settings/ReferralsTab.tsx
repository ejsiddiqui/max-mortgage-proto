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

export default function ReferralsTab() {
  const referrals = useQuery(api.referrals.list);
  const createReferral = useMutation(api.referrals.create);
  const updateReferral = useMutation(api.referrals.update);
  const removeReferral = useMutation(api.referrals.remove);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<any>(null);
  const [deletingReferral, setDeletingReferral] = useState<any>(null);
  const [togglingReferral, setTogglingReferral] = useState<any>(null);

  const [formData, setFormData] = useState({ 
    name: "", 
    contactPerson: "", 
    email: "", 
    phone: "", 
    commissionRate: 0, 
    isActive: true 
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReferral(formData);
      toast.success("Referral company added successfully");
      setIsAddModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to add referral");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateReferral({ id: editingReferral._id, ...formData });
      toast.success("Referral company updated successfully");
      setEditingReferral(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update referral");
    }
  };

  const handleDelete = async () => {
    try {
      await removeReferral({ id: deletingReferral._id });
      toast.success("Referral company deleted successfully");
      setDeletingReferral(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete referral");
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateReferral({ id: togglingReferral._id, isActive: !togglingReferral.isActive });
      toast.success(`Referral company ${togglingReferral.isActive ? 'deactivated' : 'activated'} successfully`);
      setTogglingReferral(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update referral status");
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: "", 
      contactPerson: "", 
      email: "", 
      phone: "", 
      commissionRate: 0, 
      isActive: true 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-foreground">Referral Companies</h3>
          <p className="text-sm text-muted-foreground font-medium">Manage real estate agencies and partners who refer clients.</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="rounded-xl gap-2 border-none"
        >
          <Plus className="w-4 h-4" />
          Add Company
        </Button>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-semibold text-muted-foreground">Company Name</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Contact Person</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Commission Rate</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals?.map((ref) => (
              <TableRow key={ref._id} className="hover:bg-muted/30 border-border">
                <TableCell>
                  <div className="font-medium text-foreground">{ref.name}</div>
                  <div className="text-xs text-muted-foreground">{ref.email || "-"}</div>
                </TableCell>
                <TableCell className="text-foreground">{ref.contactPerson || "-"}</TableCell>
                <TableCell className="text-foreground">{ref.commissionRate}%</TableCell>
                <TableCell>
                  <Badge variant={ref.isActive ? "default" : "secondary"} className={ref.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground"}>
                    {ref.isActive ? "Active" : "Inactive"}
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
                        onClick={() => { setEditingReferral(ref); setFormData({ name: ref.name, contactPerson: ref.contactPerson || "", email: ref.email || "", phone: ref.phone || "", commissionRate: ref.commissionRate, isActive: ref.isActive }); }}
                        className="gap-2 rounded-lg cursor-pointer focus:bg-muted"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setTogglingReferral(ref)}
                        className="gap-2 rounded-lg cursor-pointer focus:bg-muted"
                      >
                        <Power className="w-4 h-4" /> {ref.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem 
                        onClick={() => setDeletingReferral(ref)}
                        className="gap-2 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!referrals?.length && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No referral companies found. Add your first partner to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || !!editingReferral} onOpenChange={(open) => { if (!open) { setIsAddModalOpen(false); setEditingReferral(null); } }}>
        <DialogContent className="rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingReferral ? "Edit Referral Company" : "Add New Referral Company"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={editingReferral ? handleEdit : handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="refName">Company Name</Label>
              <Input 
                id="refName" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Epyc Real Estate" 
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Person</Label>
              <Input 
                id="contact" 
                value={formData.contactPerson} 
                onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                placeholder="Name" 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refRate">Commission Rate (%)</Label>
              <Input 
                id="refRate" 
                type="number" 
                step="0.01"
                value={formData.commissionRate} 
                onChange={e => setFormData({...formData, commissionRate: parseFloat(e.target.value)})}
                placeholder="10" 
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refEmail">Email Address</Label>
              <Input 
                id="refEmail" 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="email@example.com" 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refPhone">Phone Number</Label>
              <Input 
                id="refPhone" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+971 -- --- ----" 
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="md:col-span-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setEditingReferral(null); }} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl px-8">
                {editingReferral ? "Update Company" : "Add Company"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toggling Confirmation */}
      <AlertDialog open={!!togglingReferral} onOpenChange={(open) => { if (!open) setTogglingReferral(null); }}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{togglingReferral?.isActive ? 'Deactivate' : 'Activate'} {togglingReferral?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {togglingReferral?.isActive 
                ? "Deactivating this company will hide it from new project selections."
                : "Activating this company will make it available for new project selections."
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
      <AlertDialog open={!!deletingReferral} onOpenChange={(open) => { if (!open) setDeletingReferral(null); }}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete {deletingReferral?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You can only delete companies that are not currently referenced by any projects.
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
