"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Search,
  FileText,
  Settings,
  ChevronRight,
  Plus,
  BarChart3,
  CheckSquare,
  Users,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AppSidebarProps {
  user: User;
}

const NAV_ITEMS = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/audits", icon: Search, label: "Audits" },
      { href: "/findings", icon: CheckSquare, label: "Findings" },
      { href: "/reports", icon: FileText, label: "Reports" },
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/workspace/members", icon: Users, label: "Members" },
      { href: "/academy", icon: GraduationCap, label: "Fusion Academy" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const displayName = user.user_metadata?.full_name ?? user.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="w-60 flex-shrink-0 border-r border-border bg-sidebar h-screen flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Fusion UX"
            width={32}
            height={32}
            className="h-8 w-8 object-contain flex-shrink-0"
            priority
          />
          <span className="font-semibold text-sm tracking-tight">Fusion UX</span>
        </Link>
      </div>

      {/* New Audit CTA */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/audits/new"
          className={cn(
            "flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg",
            "bg-primary text-primary-foreground text-sm font-medium",
            "hover:opacity-90 transition-opacity"
          )}
        >
          <Plus className="h-4 w-4" />
          New Audit
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {NAV_ITEMS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 py-1.5">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="h-3 w-3 opacity-50" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-sidebar-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
        >
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {displayName.split(" ")[0]}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>
    </aside>
  );
}
