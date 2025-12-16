<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Clear existing data
        DB::table('role_has_permissions')->delete();
        DB::table('model_has_roles')->delete();
        DB::table('model_has_permissions')->delete();
        DB::table('roles')->delete();
        DB::table('permissions')->delete();

        // Create permissions with route names and labels (matching actual routes)
        $permissions = [
            // Dashboard permissions
            [
                'name' => 'dashboard.view',
                'label' => 'View Dashboard',
                'group' => 'Dashboard',
            ],

            // Profile permissions (matching actual route names)
            [
                'name' => 'profile.edit',
                'label' => 'Edit Profile',
                'group' => 'Profile',
            ],
            [
                'name' => 'profile.update',
                'label' => 'Update Profile',
                'group' => 'Profile',
            ],
            [
                'name' => 'profile.destroy',
                'label' => 'Delete Profile',
                'group' => 'Profile',
            ],

            // Password permissions (matching actual route names)
            [
                'name' => 'password.edit',
                'label' => 'Edit Password',
                'group' => 'Security',
            ],
            [
                'name' => 'password.update',
                'label' => 'Update Password',
                'group' => 'Security',
            ],

            // Appearance permissions
            [
                'name' => 'appearance.edit',
                'label' => 'Edit Appearance',
                'group' => 'Settings',
            ],

            // Two Factor permissions
            [
                'name' => 'two-factor.show',
                'label' => 'View Two Factor',
                'group' => 'Security',
            ],

            // Roles management permissions
            [
                'name' => 'roles.view',
                'label' => 'View Roles',
                'group' => 'Administration',
            ],
            [
                'name' => 'roles.create',
                'label' => 'Create Roles',
                'group' => 'Administration',
            ],
            [
                'name' => 'roles.edit',
                'label' => 'Edit Roles',
                'group' => 'Administration',
            ],
            [
                'name' => 'roles.delete',
                'label' => 'Delete Roles',
                'group' => 'Administration',
            ],

            // Users management permissions
            [
                'name' => 'users.view',
                'label' => 'View Users',
                'group' => 'Administration',
            ],
            [
                'name' => 'users.create',
                'label' => 'Create Users',
                'group' => 'Administration',
            ],
            [
                'name' => 'users.edit',
                'label' => 'Edit Users',
                'group' => 'Administration',
            ],
            [
                'name' => 'users.delete',
                'label' => 'Delete Users',
                'group' => 'Administration',
            ],

            // Permissions management permissions
            [
                'name' => 'permissions.view',
                'label' => 'View Permissions',
                'group' => 'Administration',
            ],
            [
                'name' => 'permissions.create',
                'label' => 'Create Permissions',
                'group' => 'Administration',
            ],
            [
                'name' => 'permissions.edit',
                'label' => 'Edit Permissions',
                'group' => 'Administration',
            ],
            [
                'name' => 'permissions.delete',
                'label' => 'Delete Permissions',
                'group' => 'Administration',
            ],
        ];

        foreach ($permissions as $permissionData) {
            Permission::updateOrCreate(
                ['name' => $permissionData['name']],
                [
                    'name' => $permissionData['name'],
                    'label' => $permissionData['label'],
                    'group' => $permissionData['group'],
                    'guard_name' => 'web',
                ]
            );
        }

        // Create admin role with full access to all existing permissions
        $adminRole = Role::firstOrCreate(['name' => User::ROLE_ADMIN]);
        Role::firstOrCreate(['name' => User::ROLE_USER]);

        $adminRole->syncPermissions([
            'dashboard.view',
            'profile.edit',
            'profile.update',
            'profile.destroy',
            'password.edit',
            'password.update',
            'appearance.edit',
            'two-factor.show',
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            'permissions.view',
            'permissions.create',
            'permissions.edit',
            'permissions.delete',
        ]);

        $this->command->info('Roles and permissions created successfully!');
        $this->command->info('');
        $this->command->info('=== AVAILABLE ROLES ===');
        $this->command->info('Admin: Full access to all permissions');
        $this->command->info('User: Basic user role (no permissions assigned by default)');
        $this->command->info('');
        $this->command->info('Use the CreateUserCommand to create users with specific roles!');
    }
}
