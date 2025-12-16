<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Yajra\DataTables\DataTables;

class UserController extends Controller
{
    /**
     * Display users listing page
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        return Inertia::render('users/index', [
            'can' => [
                'create' => $user->can('users.create'),
                'edit' => $user->can('users.edit'),
                'delete' => $user->can('users.delete'),
            ],
        ]);
    }

    /**
     * Get users data for DataTable
     */
    public function data()
    {
        $users = User::with('roles')
            ->whereDoesntHave('roles', function ($query) {
                $query->whereIn('name', [User::ROLE_ADMIN]);
            })
            ->orderBy('created_at', 'desc')
            ->when(request('search.value'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                });
            });

        return DataTables::of($users)
            ->addColumn('name', function ($user) {
                return $user->first_name.' '.$user->last_name;
            })
            ->addColumn('status', function ($user) {
                $statusClass = $user->status == User::STATUS_ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                $statusText = $user->status == User::STATUS_ACTIVE ? 'Active' : 'Inactive';

                return '<span class="px-2 py-1 text-xs font-medium rounded-full '.$statusClass.'">'.$statusText.'</span>';
            })
            ->addColumn('email_verified', function ($user) {
                return $user->email_verified_at ?
                    '<span class="text-green-600">✓ Verified</span>' :
                    '<span class="text-red-600">✗ Unverified</span>';
            })
            ->addColumn('action', function ($user) {
                $actions = [];
                /** @var \App\Models\User $authUser */
                $authUser = Auth::user();

                if ($authUser->can('users.view')) {
                    $actions[] = [
                        'type' => 'view',
                        'label' => 'View',
                        'route' => route('users.show', $user->id),
                    ];
                }

                if ($authUser->can('users.edit')) {
                    $actions[] = [
                        'type' => 'edit',
                        'label' => 'Edit',
                        'route' => route('users.edit', $user->id),
                    ];
                }

                if ($authUser->can('users.delete') && $user->id !== $authUser->id) {
                    $actions[] = [
                        'type' => 'delete',
                        'label' => 'Delete',
                        'route' => route('users.destroy', $user->id),
                    ];
                }

                return $actions;
            })
            ->rawColumns(['status', 'email_verified', 'action'])
            ->make(true);
    }

    /**
     * Show user details
     */
    public function show(User $user)
    {
        /** @var \App\Models\User $authUser */
        $authUser = Auth::user();

        $user->load('roles.permissions');

        return Inertia::render('users/show', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'status' => $user->status,
                'email_verified_at' => $user->email_verified_at?->format('d M Y, H:i'),
                'created_at' => $user->created_at->format('d M Y, H:i'),
                'updated_at' => $user->updated_at->format('d M Y, H:i'),
                'two_factor_enabled' => ! is_null($user->two_factor_secret),
                'roles' => $user->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'permissions' => $role->permissions->map(function ($permission) {
                            return [
                                'name' => $permission->name,
                                'label' => $permission->label ?: ucwords(str_replace(['.', '_'], ' ', $permission->name)),
                                'group' => $permission->group ?: 'Uncategorized',
                            ];
                        })->groupBy('group'),
                    ];
                }),
            ],
            'can' => [
                'edit' => $authUser->can('users.edit'),
                'delete' => $authUser->can('users.delete') && $user->id !== $authUser->id,
            ],
        ]);
    }

    /**
     * Show create user form
     */
    public function create()
    {
        return Inertia::render('users/create', [
            'roles' => Role::all()->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                ];
            }),
        ]);
    }

    /**
     * Store new user
     */
    public function store(StoreUserRequest $request)
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => $request->status,
            'email_verified_at' => $request->email_verified ? now() : null,
        ]);

        // Assign role if provided
        if ($request->role) {
            $role = Role::findById($request->role);
            if ($role) {
                $user->assignRole($role);
            }
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Show edit user form
     */
    public function edit(User $user)
    {
        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'status' => $user->status,
                'email_verified' => ! is_null($user->email_verified_at),
                'role' => $user->roles->first()?->id,
            ],
            'roles' => Role::all()->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                ];
            }),
        ]);
    }

    /**
     * Update user
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $updateData = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'status' => $request->status,
        ];

        if ($request->password) {
            $updateData['password'] = Hash::make($request->password);
        }

        if ($request->email_verified) {
            $updateData['email_verified_at'] = now();
        } else {
            $updateData['email_verified_at'] = null;
        }

        $user->update($updateData);

        // Update role if provided
        if ($request->has('role')) {
            $user->syncRoles([]); // Remove all existing roles
            if ($request->role) {
                $role = Role::findById($request->role);
                if ($role) {
                    $user->assignRole($role);
                }
            }
        }

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Delete user
     */
    public function destroy(User $user)
    {
        // Prevent deletion of current user
        if ($user->id === Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your own account.',
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }
}
