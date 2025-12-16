import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { type NavGroup, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Lock, Shield, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { NavUser } from './nav-user';

// Define main navigation items (not grouped)
const allMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
        permission: 'users.view',
    },
];

// Define grouped navigation items
const allNavGroups: NavGroup[] = [
    {
        title: 'Administration',
        items: [
            {
                title: 'Roles',
                href: '/roles',
                icon: Shield,
                permission: 'roles.view',
            },
            {
                title: 'Permissions',
                href: '/permissions',
                icon: Lock,
                permission: 'permissions.view',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    //
];

export function AppSidebar() {
    const { can } = usePermissions();

    // Filter navigation items based on user permissions
    const mainNavItems = allMainNavItems.filter((item) => {
        // If no permission required, show the item
        if (!item.permission) {
            return true;
        }
        // Check if user has the required permission
        return can(item.permission);
    });

    // Filter grouped navigation items based on user permissions
    const navGroups = allNavGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => {
                // If no permission required, show the item
                if (!item.permission) {
                    return true;
                }
                // Check if user has the required permission
                return can(item.permission);
            }),
        }))
        .filter((group) => group.items.length > 0); // Only show groups that have visible items

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
