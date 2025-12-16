<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Yajra\DataTables\DataTables;

class RoleController extends Controller
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Display roles listing page
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return Inertia::render('roles/index', [
            'can' => [
                'create' => $user->can('roles.create'),
                'edit' => $user->can('roles.edit'),
                'delete' => $user->can('roles.delete'),
            ],
        ]);
    }

    /**
     * Get roles data for DataTable
     */
    public function data()
    {
        $roles = Role::withCount('permissions');

        return DataTables::of($roles)
            ->addColumn('action', function ($role) {
                $actions = [];
                /** @var \App\Models\User $user */
                $user = Auth::user();

                // View action
                if ($user->can('roles.view')) {
                    $actions[] = [
                        'type' => 'view',
                        'label' => 'View',
                        'route' => route('roles.show', $role->id),
                    ];
                }

                // Edit action
                if ($user->can('roles.edit')) {
                    $actions[] = [
                        'type' => 'edit',
                        'label' => 'Edit',
                        'route' => route('roles.edit', $role->id),
                    ];
                }

                // Delete action (not for core roles)
                if ($user->can('roles.delete') && ! in_array($role->name, [User::ROLE_ADMIN, User::ROLE_USER])) {
                    $actions[] = [
                        'type' => 'delete',
                        'label' => 'Delete',
                        'route' => route('roles.destroy', $role->id),
                    ];
                }

                return $actions;
            })
            ->addColumn('permissions_count', function ($role) {
                return $role->permissions_count;
            })
            ->editColumn('created_at', function ($role) {
                return $role->created_at->format('d M Y');
            })
            ->rawColumns(['action'])
            ->make(true);
    }

    /**
     * Show role details
     */
    public function show(Role $role)
    {
        $role->load('permissions');
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return Inertia::render('roles/show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'created_at' => $role->created_at->format('d M Y, H:i'),
                'updated_at' => $role->updated_at->format('d M Y, H:i'),
                'permissions' => $role->permissions->map(function ($permission) {
                    return [
                        'name' => $permission->name,
                        'label' => $permission->label ?: ucwords(str_replace(['.', '_'], ' ', $permission->name)),
                        'group' => $permission->group ?: 'Uncategorized',
                    ];
                })->groupBy('group'),
                'permissions_count' => $role->permissions->count(),
            ],
            'can' => [
                'edit' => $user->can('roles.edit'),
                'delete' => $user->can('roles.delete') && ! in_array($role->name, [User::ROLE_ADMIN, User::ROLE_USER]),
            ],
        ]);
    }

    /**
     * Show create role form
     */
    public function create()
    {
        return Inertia::render('roles/create', [
            'permissions' => $this->permissionService->getPermissionStructure(),
        ]);
    }

    /**
     * Store new role
     */
    public function store(StoreRoleRequest $request)
    {
        $role = Role::create(['name' => $request->name]);

        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Show edit role form
     */
    public function edit(Role $role)
    {
        return Inertia::render('roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ],
            'permissions' => $this->permissionService->getPermissionStructure(),
        ]);
    }

    /**
     * Update role
     */
    public function update(UpdateRoleRequest $request, Role $role)
    {
        $role->update(['name' => $request->name]);

        $role->syncPermissions($request->permissions ?? []);

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Delete role
     */
    public function destroy(Role $role)
    {
        // Prevent deletion of core roles
        if (in_array($role->name, [User::ROLE_ADMIN, User::ROLE_USER])) {
            return back()->with('error', 'Cannot delete core system roles.');
        }

        $role->delete();

        return redirect()->route('roles.index')
            ->with('success', 'Role deleted successfully.');
    }
}
