"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Search, Bell, Moon, Sun, LogOut, Settings, User as UserIcon, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

interface AppTopBarProps {
  user: User;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
  created_at: string;
}

export function AppTopBar({ user }: AppTopBarProps) {
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Load recent audit completions as notifications
    async function loadNotifications() {
      const { data: audits } = await supabase
        .from("audits")
        .select("id, name, status, overall_score, created_at")
        .eq("created_by", user.id)
        .in("status", ["review", "completed"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (audits && audits.length > 0) {
        setNotifications(audits.map((a) => ({
          id: a.id,
          title: a.status === "completed" ? "Audit completed" : "AI analysis ready",
          message: `"${a.name}" — Score: ${a.overall_score ?? "—"}/100`,
          type: a.status === "completed" ? "success" : "info",
          read: false,
          created_at: a.created_at,
        })));
      }
    }
    loadNotifications();
  }, [user.id]);

  // Close notification panel when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function dismissNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }
  const displayName = user.user_metadata?.full_name ?? user.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 gap-4 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search audits, findings..."
            className={cn(
              "w-full pl-9 pr-4 py-1.5 rounded-lg border border-input bg-muted/50",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background",
              "transition-colors"
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false); }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-1 w-80 rounded-xl border border-border bg-popover shadow-xl z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <Bell className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                    <p className="text-xs text-muted-foreground">You'll see audit results and team activity here</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = n.type === "success" ? CheckCircle2 : n.type === "warning" ? AlertTriangle : Info;
                    const iconColor = n.type === "success" ? "text-green-500" : n.type === "warning" ? "text-orange-500" : "text-blue-500";
                    return (
                      <div
                        key={n.id}
                        className={cn("flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors", !n.read && "bg-primary/3")}
                      >
                        <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", iconColor)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-xs font-semibold", !n.read && "text-foreground")}>{n.title}</p>
                            <button onClick={() => dismissNotification(n.id)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(n.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!n.read && <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border">
                <button
                  onClick={() => { router.push("/audits"); setShowNotifications(false); }}
                  className="text-xs text-primary hover:underline"
                >
                  View all audits →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">{initials}</span>
            </div>
            <span className="text-sm font-medium hidden sm:block">
              {displayName.split(" ")[0]}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-popover shadow-lg z-20 py-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={() => { setShowUserMenu(false); router.push("/settings"); }}
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  Profile
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={() => { setShowUserMenu(false); router.push("/settings"); }}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </button>
                <div className="border-t border-border my-1" />
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
