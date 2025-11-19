"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Bot,
  Settings,
  CandlestickChart,
  BarChart,
  GitBranchPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/markets", label: "Markets", icon: BarChart },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/ai-advisor", label: "AI Advisor", icon: Bot },
  { href: "/strategies", label: "Strategies", icon: GitBranchPlus },
];

const settingsNav = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/api-connections", label: "API Connections", icon: CandlestickChart },
]

export function SidebarNav() {
  const pathname = usePathname();

  const renderNav = (items: typeof navItems) => {
    return items.map((item) => {
      const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
      return (
        <SidebarMenuItem key={item.href}>
          <Tooltip>
            <TooltipTrigger asChild>
                <Link href={item.href}>
                    <SidebarMenuButton
                        variant="ghost"
                        isActive={isActive}
                        className="w-full justify-start"
                    >
                        <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                        <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="md:hidden">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <>
      <SidebarMenu className="flex-1">
        {renderNav(navItems)}
      </SidebarMenu>
      <SidebarMenu>
        {renderNav(settingsNav)}
      </SidebarMenu>
    </>
  );
}
