import "./globals.css";

import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React from "react";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { SiteFooter } from "@/components/layouts/site-footer";
import { SiteHeader } from "@/components/layouts/site-header";
import { ToolSearchDialog } from "@/components/layouts/tool-search";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/language-context";
import { SearchProvider } from "@/contexts/search-context";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Devtools"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <SearchProvider>
              <TooltipProvider>
                <SidebarProvider
                  style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
                >
                  <ToolSearchDialog />
                  <AppSidebar variant="inset" />
                  <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col">
                      <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
                          {children}
                        </div>
                      </div>
                      <SiteFooter />
                    </div>
                  </SidebarInset>
                </SidebarProvider>
              </TooltipProvider>
            </SearchProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
