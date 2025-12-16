<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePermissionRequest;
use App\Http\Requests\UpdatePermissionRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Yajra\DataTables\Facades\DataTables;

class PermissionController extends Controller
{
    /**
     * Display a listing of the permissions.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return Inertia::render('permissions/index', [
            'can' => [
                'create' => $user->can('permissions.create'),
                'edit' => $user->can('permissions.edit'),
                'delete' => $user->can('permissions.delete'),
            ],
        ]);
    }

    /**
     * Get permissions data for DataTable
     */
    public function data()
    {
        $permissions = Permission::query();

        return DataTables::of($permissions)
            ->addColumn('action', function ($permission) {
                $actions = [];
                /** @var \App\Models\User $user */
                $user = Auth::user();

                if ($user->can('permissions.view')) {
                    $actions[] = [
                        'type' => 'view',
                        'label' => 'View',
                        'route' => route('permissions.show', $permission->id),
                    ];
                }

                if ($user->can('permissions.edit')) {
                    $actions[] = [
                        'type' => 'edit',
                        'label' => 'Edit',
                        'route' => route('permissions.edit', $permission->id),
                    ];
                }

                if ($user->can('permissions.delete')) {
                    $actions[] = [
                        'type' => 'delete',
                        'label' => 'Delete',
                        'route' => route('permissions.destroy', $permission->id),
                    ];
                }

                return $actions;
            })
            ->editColumn('group', function ($permission) {
                return $permission->group ? ucwords(str_replace('_', ' ', $permission->group)) : 'General';
            })
            ->editColumn('label', function ($permission) {
                return $permission->label ?: ucwords(str_replace(['.', '_'], ' ', $permission->name));
            })
            ->editColumn('created_at', function ($permission) {
                return $permission->created_at ? $permission->created_at->format('M d, Y') : '';
            })
            ->rawColumns(['action'])
            ->make(true);
    }

    /**
     * Show the form for creating a new permission.
     */
    public function create()
    {
        // Get existing groups from permissions
        $existingGroups = Permission::whereNotNull('group')
            ->distinct()
            ->pluck('group')
            ->filter()
            ->sort()
            ->values()
            ->toArray();

        return Inertia::render('permissions/create', [
            'existingGroups' => $existingGroups,
        ]);
    }

    /**
     * Store a newly created permission in storage.
     */
    public function store(StorePermissionRequest $request)
    {
        Permission::create([
            'name' => $request->name,
            'label' => $request->label,
            'group' => $request->group,
            'guard_name' => 'web',
        ]);

        return redirect()->route('permissions.index');
    }

    /**
     * Display the specified permission.
     */
    public function show(Permission $permission)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return Inertia::render('permissions/show', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'label' => $permission->label,
                'group' => $permission->group,
                'created_at' => $permission->created_at->format('M d, Y'),
                'updated_at' => $permission->updated_at->format('M d, Y'),
            ],
            'can' => [
                'edit' => $user->can('permissions.edit'),
                'delete' => $user->can('permissions.delete'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified permission.
     */
    public function edit(Permission $permission)
    {
        // Get existing groups from permissions
        $existingGroups = Permission::whereNotNull('group')
            ->distinct()
            ->pluck('group')
            ->filter()
            ->sort()
            ->values()
            ->toArray();

        return Inertia::render('permissions/edit', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
                'label' => $permission->label,
                'group' => $permission->group,
            ],
            'existingGroups' => $existingGroups,
        ]);
    }

    /**
     * Update the specified permission in storage.
     */
    public function update(UpdatePermissionRequest $request, Permission $permission)
    {
        $permission->update([
            'name' => $request->name,
            'label' => $request->label,
            'group' => $request->group,
        ]);

        return redirect()->route('permissions.index');
    }

    /**
     * Remove the specified permission from storage.
     */
    public function destroy(Permission $permission)
    {
        try {
            $permission->delete();

            return redirect()->route('permissions.index')
                ->with('success', 'Permission deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error deleting permission: '.$e->getMessage());
        }
    }
}
