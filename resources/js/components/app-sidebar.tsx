import { Link } from '@inertiajs/react';
import { Baby, Bell, Camera, Home, LayoutDashboard, MessageCircle } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Inicio',
        href: '/',
        icon: Home,
    },
    {
        title: 'Mi Explotación',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Escanear Crotal',
        href: '/scanner',
        icon: Camera,
    },
    {
        title: 'Comunicar Nacimiento',
        href: '/nacimientos/crear',
        icon: Baby,
    },
    {
        title: 'Normativa',
        href: '/normativa',
        icon: Bell,
    },
    {
        title: 'NekazarIA Chat',
        href: '/chat',
        icon: MessageCircle,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
