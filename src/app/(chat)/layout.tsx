// app/(chat)/layout.tsx
import { cookies } from 'next/headers'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const isCollapsed = (await cookies()).get('sidebar_state')?.value !== 'true'
  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar user={undefined} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
