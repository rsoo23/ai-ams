import React from "react";
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./_components/app-sidebar";
import { ThemeProvider } from "./_components/theme-provider";
import { PageTitle } from "./_components/page-title";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "@/components/ui/sonner"
import { ReactQueryProvider } from "./_components/react-query-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <NextTopLoader
          color="#dddddd"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          showSpinner={true}
          easing="ease-in-out"
          speed={100}
          shadow="0 0 10px #dddddd,0 0 5px #dddddd"
          zIndex={1600}
          showAtBottom={false}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex flex-col p-4 md:p-6 lg:p-8 min-h-screen w-full">
                <PageTitle />
                {children}
              </main>
              <Toaster position="top-right" richColors />
            </SidebarProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
