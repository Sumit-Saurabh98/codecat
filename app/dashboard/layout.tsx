"use client";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logout from "@/module/auth/components/Logout";
import { useState, useEffect } from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
  }, []);

  const user = session?.user;
  const userName = user?.name || "Guest";
  const userAvatar = user?.image || "";
  const userInitials = userName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toLocaleUpperCase();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 cursor-pointer hover:bg-accent rounded-md p-2 transition-colors" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-lg hover:bg-accent border-border cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            <Separator orientation="vertical" className="mx-2 h-4" />

            {/* User Menu */}
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-border hover:ring-primary transition-all cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userAvatar || "/profile.png"} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 rounded-lg"
                  align="end"
                  sideOffset={8}
                >
                  <div className="flex items-center gap-3 px-2 py-3">
                    <Avatar className="h-10 w-10 ring-2 ring-border">
                      <AvatarImage src={userAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {userName}
                      </p>
                      <p
                        className="text-xs text-muted-foreground truncate"
                        title={user?.email}
                      >
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive rounded-md">
                    <Logout className="w-full flex items-center gap-2">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Logout>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
