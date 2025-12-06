// src/components/layout/sidebar-nav.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import {
  Home, MessageSquareHeart, ClipboardList, ScanEye, Settings2, Info, PillIcon, BellRing, Orbit, BookMarked, Sparkles
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SidebarNavProps {
  unreadNotificationCount: number;
}

const navItems = [
  { href: '/', label: 'Home', icon: Home, ariaLabel: 'Go to Home page' },
  { href: '/chat', label: 'Chat', icon: MessageSquareHeart, ariaLabel: 'Open Chat interface' },
  { href: '/medications', label: 'Medications', icon: PillIcon, ariaLabel: 'Manage Medications' },
  { href: '/ar-viewer', label: 'AR Viewer', icon: ScanEye, ariaLabel: 'Open AR Viewer' },
  { href: '/explorer', label: '3D Explorer', icon: Orbit, ariaLabel: 'Open 3D Interactive Explorer' },
  { href: '/pro', label: 'Clinical Suite', icon: ClipboardList, ariaLabel: 'Open Professional Clinical Suite' },
  { href: '/medico', label: 'Medico Hub', icon: BookOpen, ariaLabel: 'Open Medico Study Hub' },
  { href: '/notifications', label: 'Notifications', icon: BellRing, ariaLabel: 'View Notifications' },
  { href: '/feedback', label: 'Feedback', icon: Info, ariaLabel: 'Submit Feedback' },
];

export function SidebarNav({ unreadNotificationCount }: SidebarNavProps) {
  const pathname = usePathname();
  const { isMobile, state: sidebarState } = useSidebar();

  return (
    <TooltipProvider>
      <SidebarHeader className="p-2 pt-3">
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const isNotifications = item.href === '/notifications';
            const badgeCount = isNotifications ? unreadNotificationCount : 0;

            return (
              <SidebarMenuItem key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={item.href} passHref>
                      <SidebarMenuButton as="a" isActive={isActive} aria-label={item.ariaLabel} className={cn("justify-start w-full rounded-lg group transition-all duration-200 ease-in-out", isActive ? "bg-sidebar-active-background text-sidebar-active-foreground shadow-lg font-semibold" : "text-sidebar-foreground/80 hover:text-sidebar-foreground")}>
                          <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                  <item.icon className={cn("h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110", isActive && "text-sidebar-active-foreground")} />
                                  <span>{item.label}</span>
                              </div>
                              {isNotifications && badgeCount > 0 && (<Badge className="h-5 px-1.5 text-xs ml-auto group-data-[collapsible=icon]:hidden">{badgeCount}</Badge>)}
                          </div>
                      </SidebarMenuButton>
                    </Link>
                  </TooltipTrigger>
                  {(sidebarState === "collapsed" || isMobile) && (
                    <TooltipContent side="right" align="center" className="bg-sidebar text-sidebar-foreground border-sidebar-border shadow-md">
                      {item.label}
                      {isNotifications && badgeCount > 0 && ` (${badgeCount})`}
                    </TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
             <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/settings" passHref>
                    <SidebarMenuButton as="a" isActive={pathname.startsWith('/settings')} aria-label="Open Settings" className={cn("justify-start w-full rounded-lg group", pathname.startsWith('/settings') ? "bg-sidebar-active-background text-sidebar-active-foreground shadow-lg font-semibold" : "text-sidebar-foreground/80 hover:text-sidebar-foreground")}>
                        <Settings2 className="h-5 w-5" />
                        <span>Settings</span>
                    </SidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                {(sidebarState === "collapsed" || isMobile) && (<TooltipContent side="right" align="center" className="bg-sidebar text-sidebar-foreground border-sidebar-border shadow-md">Settings</TooltipContent>)}
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </TooltipProvider>
  );
}
