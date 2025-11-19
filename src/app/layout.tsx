import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Bot } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AetherMind Trading',
  description: 'AI-Powered Trading Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <Button variant="ghost" className="flex items-center gap-2" asChild>
                <Link href="/">
                  <Bot className="size-6 text-primary" />
                  <h1 className={cn("text-xl font-semibold")}>
                    AetherMind
                  </h1>
                </Link>
              </Button>
            </SidebarHeader>
            <SidebarContent>
              <SidebarNav />
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
