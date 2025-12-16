import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage, type InertiaLinkProps } from '@inertiajs/react';

interface NavMainProps {
    items?: NavItem[];
    groups?: NavGroup[];
}

export function NavMain({ items = [], groups = [] }: NavMainProps) {
    const page = usePage();

    // Helper function to get href string for comparison
    const getHrefString = (
        href: NonNullable<InertiaLinkProps['href']>,
    ): string => {
        if (typeof href === 'string') {
            return href;
        }
        return href.url;
    };

    return (
        <>
            {/* Render individual items */}
            {items.length > 0 && (
                <SidebarGroup className="mt-6 px-4 py-0">
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith(
                                        getHrefString(item.href),
                                    )}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {/* Render grouped items */}
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="mt-6 px-4 py-0">
                    <SidebarGroupLabel className="mb-2 text-xs text-sidebar-foreground/70">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith(
                                        getHrefString(item.href),
                                    )}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
