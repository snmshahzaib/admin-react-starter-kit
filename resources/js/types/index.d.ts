import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: string | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    permissions: {
        structure: Record<string, unknown>;
    };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    permissions?: string[];
    roles?: string[];
    permission_groups?: Record<string, unknown>;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PageProps extends Record<string, unknown> {
    auth: Auth;
    flash: {
        message?: string;
        error?: string;
        success?: string;
    };
}

export interface PermissionStructure {
    [groupKey: string]: Array<{
        name: string;
        label: string;
    }>;
}
