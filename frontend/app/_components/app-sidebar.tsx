import { Home, Settings, BotMessageSquare, NotebookPen, NotebookText, Scale } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import ProfileAvatar from "./profile-avatar"
import { TypographyH3, TypographyP } from "./typography"

export const sidebarItems = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Journal Entries",
    url: "/journal-entries",
    icon: NotebookPen,
  },
  {
    title: "General Ledger",
    url: "/general-ledger",
    icon: NotebookText,
  },
  // {
  //   title: "Trial Balance",
  //   url: "/trial-balance",
  //   icon: Scale,
  // },
  {
    title: "Virtual CFO",
    url: "/virtual-cfo",
    icon: BotMessageSquare,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 pb-0">
        <div className="flex gap-2 flex-row items-center w-full">
          <div className="flex gap-2 flex-row items-center w-full">
            <TypographyH3>
              Centif.AI
            </TypographyH3>
          </div>
          <ModeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex gap-3 flex-row items-center w-full">
          <ProfileAvatar className="rounded-sm" />
          <div className="flex flex-col w-full">
            <TypographyP className="text-sm">
              Rong Jie Soo
            </TypographyP>
            <TypographyP className="text-xs font-extralight">
              rongjie.soo@example.com
            </TypographyP>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}