import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth, permissions } = usePage<SharedData>().props;

    /**
     * Check if user has a specific permission
     */
    const can = (permission: string): boolean => {
        return auth.user?.permissions?.includes(permission) || false;
    };

    /**
     * Check if user has any of the provided permissions
     */
    const canAny = (perms: string[]): boolean => {
        return perms.some((permission) => can(permission));
    };

    /**
     * Check if user has all of the provided permissions
     */
    const canAll = (perms: string[]): boolean => {
        return perms.every((permission) => can(permission));
    };

    /**
     * Check if user has a specific role
     */
    const hasRole = (role: string): boolean => {
        return auth.user?.roles?.includes(role) || false;
    };

    /**
     * Check if user has any of the provided roles
     */
    const hasAnyRole = (roles: string[]): boolean => {
        return roles.some((role) => hasRole(role));
    };

    /**
     * Get permission label from permission name
     */
    const getPermissionLabel = (permission: string): string => {
        const structure = permissions?.structure || {};

        for (const groupValue of Object.values(structure)) {
            const group = groupValue as { permissions: Record<string, { label: string }> };
            if (group.permissions?.[permission]) {
                return group.permissions[permission].label;
            }
        }

        // Fallback: convert permission name to readable format
        return permission
            .split('.')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    /**
     * Check if user can access any permission in a group
     */
    const canAccessGroup = (groupName: string): boolean => {
        const structure = permissions?.structure || {};
        const groupValue = structure[groupName];
        const group = groupValue as { permissions: Record<string, unknown> } | undefined;

        if (!group || !group.permissions) return false;

        return Object.keys(group.permissions).some((permission) =>
            can(permission),
        );
    };

    /**
     * Get user's permissions grouped by category
     */
    const getUserPermissionGroups = () => {
        return auth.user?.permission_groups || {};
    };

    return {
        can,
        canAny,
        canAll,
        hasRole,
        hasAnyRole,
        getPermissionLabel,
        canAccessGroup,
        getUserPermissionGroups,
        user: auth.user,
        permissions: auth.user?.permissions || [],
        roles: auth.user?.roles || [],
    };
}
