"use client";
import { useSession } from "@/lib/auth-client";
import { Github, Settings, LayoutDashboard, CircleDollarSign, MessageCircleCode } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export const AppSidebar = () => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
  }, []);

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Repository",
      url: "/dashboard/repository",
      icon: Github,
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: MessageCircleCode,
    },
    {
      title: "Subscription",
      url: "/dashboard/subscription",
      icon: CircleDollarSign,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/");
  };

  if (!mounted || !session) return null;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground shrink-0">
            <Github className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">CodeCat</span>
            <span className="text-xs text-muted-foreground">Code Review Partner</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider">
            Navigation
          </p>
        </div>

        <SidebarMenu className="gap-1">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`h-11 px-4 rounded-lg transition-all duration-200 ${
                  isActive(item.url)
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "hover:bg-accent text-foreground hover:text-accent-foreground"
                }`}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
