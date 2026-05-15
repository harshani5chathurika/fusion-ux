import { Metadata } from "next";
import { Bell, CheckCircle2, AlertTriangle, FileText, Users } from "lucide-react";

export const metadata: Metadata = { title: "Notifications" };

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "finding",
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50 dark:bg-orange-950/30",
    title: "3 new critical findings detected",
    description: "AI analysis on \"Checkout Flow Audit\" identified 3 critical usability issues.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    type: "report",
    icon: FileText,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    title: "PDF report is ready",
    description: "Your report for \"Homepage UX Audit\" has been generated and is ready to download.",
    time: "Yesterday",
    unread: true,
  },
  {
    id: "3",
    type: "audit",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    iconBg: "bg-green-50 dark:bg-green-950/30",
    title: "Audit marked as complete",
    description: "\"Mobile App Navigation Audit\" has been completed with a UX score of 74.",
    time: "2 days ago",
    unread: false,
  },
  {
    id: "4",
    type: "team",
    icon: Users,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    title: "Team collaboration coming soon",
    description: "Multi-user workspaces with real-time notifications are available in the Pro plan.",
    time: "1 week ago",
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">Stay updated on your audits and findings</p>
        </div>
        <button className="text-xs text-primary hover:underline">Mark all as read</button>
      </div>

      <div className="space-y-2">
        {MOCK_NOTIFICATIONS.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              className={`rounded-xl border p-4 flex items-start gap-4 transition-colors ${
                notif.unread
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.iconBg}`}>
                <Icon className={`h-5 w-5 ${notif.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{notif.title}</p>
                  {notif.unread && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-3">
        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto">
          <Bell className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Real-time notifications</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Email and in-app notifications for audit completions, new findings, and team activity
            are available in the Pro plan.
          </p>
        </div>
      </div>
    </div>
  );
}
