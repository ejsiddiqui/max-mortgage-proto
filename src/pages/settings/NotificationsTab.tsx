import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MessageSquare, BellRing } from "lucide-react";

export default function NotificationsTab() {
  const handleToggle = (setting: string, enabled: boolean) => {
    toast.info(`${setting} ${enabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-foreground">Notifications</h3>
        <p className="text-sm text-muted-foreground">Configure how and when you want to be notified.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/30">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <Label htmlFor="email-notif" className="text-base font-semibold text-foreground">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive project updates and document alerts via email.</p>
            </div>
          </div>
          <Switch id="email-notif" defaultChecked onCheckedChange={(checked) => handleToggle("Email notifications", checked)} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/30">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <Label htmlFor="push-notif" className="text-base font-semibold text-foreground">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Real-time alerts in your browser when milestones are reached.</p>
            </div>
          </div>
          <Switch id="push-notif" defaultChecked onCheckedChange={(checked) => handleToggle("Push notifications", checked)} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/30">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <Label htmlFor="sms-notif" className="text-base font-semibold text-foreground">SMS Alerts</Label>
              <p className="text-sm text-muted-foreground">Critical status changes sent directly to your phone.</p>
            </div>
          </div>
          <Switch id="sms-notif" onCheckedChange={(checked) => handleToggle("SMS alerts", checked)} />
        </div>
      </div>
    </div>
  );
}
