'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, Settings, LayoutDashboard, CandlestickChart } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '../ui/button';
import { BtcIcon } from '../icons/crypto';

function MainSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border"
      variant="sidebar"
    >
      <SidebarHeader>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <BtcIcon className="text-primary" />
          </Link>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/'}
              tooltip={{
                children: 'Investments',
              }}
            >
              <Link href="/">
                <Wallet />
                <span>Investments</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/strategies'}
              tooltip={{
                children: 'Strategies',
              }}
            >
              <Link href="#">
                <CandlestickChart />
                <span>Strategies</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/settings'}
              tooltip={{
                children: 'Settings',
              }}
            >
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b px-4 lg:justify-end">
          <SidebarTrigger className="lg:hidden" />
          {/* Add user menu or other header items here */}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
