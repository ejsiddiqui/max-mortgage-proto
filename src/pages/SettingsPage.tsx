import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, Users as UsersIcon, Bell, ShieldCheck, CreditCard } from "lucide-react";
import ProfileTab from "./settings/ProfileTab";
import BanksTab from "./settings/BanksTab";
import ReferralsTab from "./settings/ReferralsTab";
import UsersTab from "./settings/UsersTab";
import NotificationsTab from "./settings/NotificationsTab";

export default function SettingsPage() {
  const { role } = useCurrentUser();
  const isAdmin = role === "admin";
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your profile, system preferences and master tables.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col lg:flex-row gap-8">
        <TabsList className="lg:w-64 h-auto flex flex-col bg-card border border-border p-2 rounded-2xl gap-1">
          <TabsTrigger value="profile" className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-muted-foreground data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-colors">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          
          {isAdmin && (
            <>
              <TabsTrigger value="banks" className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-muted-foreground data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-colors">
                <Building2 className="w-4 h-4" />
                <span>Banks</span>
              </TabsTrigger>
              <TabsTrigger value="referrals" className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-muted-foreground data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-colors">
                <CreditCard className="w-4 h-4" />
                <span>Referral Companies</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-muted-foreground data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-colors">
                <UsersIcon className="w-4 h-4" />
                <span>Users</span>
              </TabsTrigger>
            </>
          )}

          <TabsTrigger value="notifications" className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-muted-foreground data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-colors">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          
          <TabsTrigger value="security" className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-muted-foreground data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-colors">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy & Security</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-sm">
          <TabsContent value="profile" className="mt-0">
            <ProfileTab />
          </TabsContent>
          
          {isAdmin && (
            <>
              <TabsContent value="banks" className="mt-0">
                <BanksTab />
              </TabsContent>
              <TabsContent value="referrals" className="mt-0">
                <ReferralsTab />
              </TabsContent>
              <TabsContent value="users" className="mt-0">
                <UsersTab />
              </TabsContent>
            </>
          )}

          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab />
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <div className="space-y-4 text-center py-12">
              <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Password change and two-factor authentication will be available in v2.</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
