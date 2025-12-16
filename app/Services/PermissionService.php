<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;

class PermissionService
{
    /**
     * Get all permissions with their labels and groups
     */
    public static function getPermissionStructure(): array
    {
        // Get all permissions with their stored labels and groups from database
        $permissions = Permission::all(['name', 'label', 'group']);

        $groups = [];

        foreach ($permissions as $permission) {
            $groupKey = strtolower($permission->group ?: 'uncategorized');

            // Initialize group if not exists
            if (! isset($groups[$groupKey])) {
                $groups[$groupKey] = [];
            }

            // Add permission to group as array of objects
            $groups[$groupKey][] = [
                'name' => $permission->name,
                'label' => $permission->label ?: ucwords(str_replace(['.', '_'], ' ', $permission->name)),
            ];
        }

        return $groups;
    }

    /**
     * Get permission label by name from database
     */
    public static function getPermissionLabel(string $permission): string
    {
        $permissionModel = Permission::where('name', $permission)->first();

        if ($permissionModel && $permissionModel->label) {
            return $permissionModel->label;
        }

        // Fallback to formatted permission name
        return ucwords(str_replace(['.', '_'], ' ', $permission));
    }

    /**
     * Check if user can access any route in a group
     */
    public static function canAccessGroup(string $groupName): bool
    {
        $structure = self::getPermissionStructure();

        if (! isset($structure[$groupName])) {
            return false;
        }

        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (! $user) {
            return false;
        }

        foreach ($structure[$groupName]['permissions'] as $permission => $details) {
            if ($user->can($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get user's permissions grouped by category
     */
    public static function getUserPermissionsByGroup(): array
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (! $user) {
            return [];
        }

        $userPermissions = $user->getAllPermissions()->pluck('name')->toArray();
        $structure = self::getPermissionStructure();
        $result = [];

        foreach ($structure as $groupKey => $permissions) {
            $groupPermissions = [];

            foreach ($permissions as $permission) {
                if (in_array($permission['name'], $userPermissions)) {
                    $groupPermissions[] = $permission;
                }
            }

            // Only add group if it has permissions
            if (! empty($groupPermissions)) {
                $result[$groupKey] = $groupPermissions;
            }
        }

        return $result;
    }
}
