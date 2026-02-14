import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Loader2, Camera } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState, useEffect, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export default function ProfileTab() {
  const { user } = useCurrentUser();
  const { theme, setTheme } = useTheme();
  const updateUser = useMutation(api.users.update);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    region: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        region: user.region || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateUser({
        id: user._id,
        ...formData,
      });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();

      // 2. Post the file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // 3. Update user profile with storageId (or URL)
      // Note: We'll store the storageId and the app should ideally handle it,
      // but for simplicity with Avatar component, we might want the URL.
      // However, patching with the new image will trigger a re-render.
      // We'll update the user's image field.
      await updateUser({
        id: user._id,
        image: storageId, // The update mutation should handle resolving this or we use a separate field
      });

      toast.success("Profile image updated", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">My Profile</h3>
          <p className="text-sm text-muted-foreground">Update your personal information and how others see you.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative group">
            <Avatar className="w-32 h-32 rounded-3xl border-4 border-background shadow-inner overflow-hidden">
              <AvatarImage src={user?.image} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {getInitials(user?.name || user?.email)}
              </AvatarFallback>
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </Avatar>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleImageClick}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 rounded-xl shadow-lg border-border hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
              {isUploading ? "" : "Change"}
            </Button>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl border-border bg-muted/30" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">Email Address</Label>
              <Input id="email" defaultValue={user?.email} disabled className="rounded-xl border-border bg-muted/50 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground/80">Phone Number</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+971 -- --- ----" 
                className="rounded-xl border-border bg-muted/30" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region" className="text-foreground/80">Region</Label>
              <Input 
                id="region" 
                value={formData.region} 
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="e.g. Dubai, UAE" 
                className="rounded-xl border-border bg-muted/30" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-10 border-t border-border/50">
        <div>
          <h3 className="text-xl font-bold text-foreground">System Preferences</h3>
          <p className="text-sm text-muted-foreground">Customize your interface theme and application behavior.</p>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground/80">Interface Theme</Label>
          <ToggleGroup 
            type="single" 
            value={theme} 
            onValueChange={(value) => value && setTheme(value)}
            className="justify-start gap-3"
          >
            <ToggleGroupItem 
              value="light" 
              className="flex items-center gap-2 px-6 py-5 rounded-xl border border-border data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border-primary/50 transition-all"
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="dark" 
              className="flex items-center gap-2 px-6 py-5 rounded-xl border border-border data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border-primary/50 transition-all"
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="system" 
              className="flex items-center gap-2 px-6 py-5 rounded-xl border border-border data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border-primary/50 transition-all"
            >
              <Monitor className="w-4 h-4" />
              <span>System</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
        <Button 
          variant="outline" 
          className="rounded-xl border-border"
          onClick={() => user && setFormData({ name: user.name || "", phone: user.phone || "", region: user.region || "" })}
          disabled={isSaving}
        >
          Reset
        </Button>
        <Button 
          className="rounded-xl px-8 min-w-[140px]" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
