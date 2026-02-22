"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Filter,
  Handshake,
  Bell,
  Settings,
  Home,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "物件一覧", icon: Building2 },
  { href: "/dashboard/conditions", label: "検索条件", icon: Filter },
  { href: "/dashboard/deals", label: "過去取引", icon: Handshake },
  { href: "/dashboard/analysis", label: "投資分析", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "通知履歴", icon: Bell },
  { href: "/dashboard/settings", label: "設定", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
          <Home className="w-6 h-6" />
          <span className="text-xl font-bold">買取AI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-xl font-bold text-gray-800">
            買取AI マッチング通知
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-gray-50 p-8">{children}</main>
      </div>
    </div>
  );
}
