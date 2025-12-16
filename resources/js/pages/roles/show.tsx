import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import roles from '@/routes/roles';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface Permission {
    name: string;
    label: string;
    group: string;
}

interface Role {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    permissions: Record<string, Permission[]>;
    permissions_count: number;
}

interface RoleShowProps extends PageProps {
    role: Role;
    can: {
        edit: boolean;
        delete: boolean;
    };
}

export default function RoleShow({ role, can }: RoleShowProps) {
    const [openAccordions, setOpenAccordions] = useState<string[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Roles',
            href: '/roles',
        },
        {
            title: role.name.replace('_', ' '),
            href: `/roles/${role.id}`,
        },
    ];

    const toggleAccordion = (groupKey: string) => {
        setOpenAccordions((prev) =>
            prev.includes(groupKey)
                ? prev.filter((key) => key !== groupKey)
                : [...prev, groupKey],
        );
    };

    // Get role permissions as an array of permission names
    const rolePermissions = Object.values(role.permissions)
        .flat()
        .map((p) => p.name);

    const isGroupSelected = (groupKey: string) => {
        const groupPermissions =
            role.permissions[groupKey]?.map((p) => p.name) || [];
        return (
            groupPermissions.length > 0 &&
            groupPermissions.every((p) => rolePermissions.includes(p))
        );
    };

    const isGroupPartiallySelected = (groupKey: string) => {
        const groupPermissions =
            role.permissions[groupKey]?.map((p) => p.name) || [];
        return (
            groupPermissions.some((p) => rolePermissions.includes(p)) &&
            !isGroupSelected(groupKey)
        );
    };

    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'This action cannot be undone!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
            });

            if (result.isConfirmed) {
                router.delete(roles.destroy.url(role.id), {
                    onSuccess: () => {
                        router.visit(roles.index.url(), {
                            onSuccess: () => {
                                Swal.fire({
                                    title: 'Deleted!',
                                    text: 'The role has been deleted successfully.',
                                    icon: 'success',
                                    timer: 1500,
                                    showConfirmButton: false,
                                });
                            },
                        });
                    },
                    onError: (errors) => {
                        console.error('Delete failed:', errors);
                        Swal.fire({
                            title: 'Error!',
                            text: 'An error occurred while deleting the role.',
                            icon: 'error',
                        });
                    },
                });
            }
        } catch (error) {
            console.error('SweetAlert error:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Role: ${role.name}`} />

            <div className="space-y-6 px-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Role: {role.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {can.edit && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={roles.edit.url(role.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Role
                                </Link>
                            </Button>
                        )}
                        {can.delete && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Role
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Role Name Section */}
                    <Card>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Role Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={role.name}
                                        disabled
                                        className=""
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions Section */}
                    <Card>
                        <CardContent>
                            <div className="space-y-4">
                                <Label>Permissions</Label>
                                <p className="text-sm text-gray-600">
                                    View the permissions assigned to this role.
                                </p>
                                <div className="space-y-4">
                                    {Object.entries(role.permissions).map(
                                        ([groupKey, groupPermissions]) => {
                                            const isOpen =
                                                openAccordions.includes(
                                                    groupKey,
                                                );
                                            const isAllSelected =
                                                isGroupSelected(groupKey);
                                            const isPartiallySelected =
                                                isGroupPartiallySelected(
                                                    groupKey,
                                                );

                                            return (
                                                <Collapsible
                                                    key={groupKey}
                                                    open={isOpen}
                                                    onOpenChange={() =>
                                                        toggleAccordion(
                                                            groupKey,
                                                        )
                                                    }
                                                    className="rounded-lg border border-sidebar-border"
                                                >
                                                    <CollapsibleTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                'bg-primary-lite hover:bg-primary-liter flex w-full items-center justify-between p-4 text-left dark:bg-neutral-900',
                                                                isOpen
                                                                    ? 'rounded-t-lg'
                                                                    : 'rounded-lg',
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {isOpen ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                                <span className="font-medium capitalize">
                                                                    {groupKey}{' '}
                                                                    Permissions
                                                                </span>
                                                                <span className="text-sm text-gray-500">
                                                                    (
                                                                    {
                                                                        groupPermissions.length
                                                                    }{' '}
                                                                    permission
                                                                    {groupPermissions.length !==
                                                                    1
                                                                        ? 's'
                                                                        : ''}
                                                                    )
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isAllSelected && (
                                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                                        All
                                                                        Selected
                                                                    </span>
                                                                )}
                                                                {isPartiallySelected && (
                                                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                                                        Partial
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent className="border-t border-border">
                                                        <div className="p-4">
                                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                                {groupPermissions.map(
                                                                    (
                                                                        permission,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                permission.name
                                                                            }
                                                                            className="flex items-center space-x-3"
                                                                        >
                                                                            <Checkbox
                                                                                id={
                                                                                    permission.name
                                                                                }
                                                                                checked={rolePermissions.includes(
                                                                                    permission.name,
                                                                                )}
                                                                                disabled
                                                                            />
                                                                            <Label
                                                                                htmlFor={
                                                                                    permission.name
                                                                                }
                                                                                className="cursor-default text-sm font-normal"
                                                                            >
                                                                                {
                                                                                    permission.label
                                                                                }
                                                                            </Label>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
