"use client";

import Link from "next/link";
import { DollarSign, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getBalance } from "@/lib/services/bybit-service";
import { Breadcrumbs } from "./breadcrumbs";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";

async function PortfolioValue() {
    const totalPortfolioValue = await getBalance();
    return (
        <div className="flex h-9 w-full items-center justify-end rounded-lg border border-dashed bg-card pl-8 pr-4 font-mono text-sm font-medium tabular-nums shadow-sm">
            {totalPortfolioValue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
            })}
        </div>
    )
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <Breadcrumbs />
      <div className="relative ml-auto flex-1 md:grow-0">
        <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
          <DollarSign className="h-4 w-4" />
        </div>
        <Suspense fallback={<Skeleton className="h-9 w-32" />}>
            <PortfolioValue />
        </Suspense>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
