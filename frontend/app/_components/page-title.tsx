"use client";

import { usePathname } from "next/navigation"
import { TypographyH2 } from "./typography";
import { sidebarItems } from "./app-sidebar";

export const PageTitle = () => {
    const path = usePathname();
    const title = sidebarItems.find(item => item.url === path)?.title;

    return (
      <div className="w-full flex flex-start">
        <TypographyH2>{title || "AI-AMS"}</TypographyH2>
      </div>
    )
}
