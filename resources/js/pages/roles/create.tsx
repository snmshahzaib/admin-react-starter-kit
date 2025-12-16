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
import { BreadcrumbItem, PermissionStructure } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface CreateRoleProps {
    permissions: PermissionStructure;
}

export default function CreateRole({ permissions }: CreateRoleProps) {
    const [openAccordions, setOpenAccordions] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Roles',
            href: '/roles',
        },
    ];
    const toggleAccordion = (groupKey: string) => {
        setOpenAccordions((prev) =>
            prev.includes(groupKey)
                ? prev.filter((key) => key !== groupKey)
                : [...prev, groupKey],
        );
    };

    const handlePermissionChange = (
        permissionName: string,
        checked: boolean,
    ) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permissionName),
            );
        }
    };

    const handleSelectAll = (groupKey: string) => {
        const groupPermissions = permissions[groupKey].map((p) => p.name);
        const newPermissions = [
            ...new Set([...data.permissions, ...groupPermissions]),
        ];
        setData('permissions', newPermissions);
    };

    const handleClearAll = (groupKey: string) => {
        const groupPermissions = permissions[groupKey].map((p) => p.name);
        const newPermissions = data.permissions.filter(
            (p) => !groupPermissions.includes(p),
        );
        setData('permissions', newPermissions);
    };

    const isGroupSelected = (groupKey: string) => {
        const groupPermissions = permissions[groupKey].map((p) => p.name);
        return (
            groupPermissions.length > 0 &&
            groupPermissions.every((p) => data.permissions.includes(p))
        );
    };

    const isGroupPartiallySelected = (groupKey: string) => {
        const groupPermissions = permissions[groupKey].map((p) => p.name);
        return (
            groupPermissions.some((p) => data.permissions.includes(p)) &&
            !isGroupSelected(groupKey)
        );
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate at least 1 permission is selected
        if (data.permissions.length === 0) {
            await Swal.fire({
                title: 'Validation Error',
                text: 'Please select at least one permission for this role.',
                icon: 'warning',
                confirmButtonColor: '#3b82f6',
            });
            return;
        }

        post(roles.store.url(), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Role has been created successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                    timerProgressBar: true,
                });
            },
            onError: (errors) => {
                console.error('Creation failed:', errors);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while creating the role.',
                    icon: 'error',
                    confirmButtonColor: '#3b82f6',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />

            <div className="space-y-6 px-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Create New Role
                        </h1>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Role Name Section */}
                    <Card>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">
                                        Role Name{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Enter role name (e.g., editor, manager)"
                                        className={
                                            errors.name ? 'border-red-500' : ''
                                        }
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions Section */}
                    <Card>
                        <CardContent>
                            <div className="space-y-4">
                                <Label>
                                    Permissions{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Select the permissions for this role. You
                                    can expand each group and use "Select All"
                                    or "Clear All" for convenience.
                                </p>
                                <div className="space-y-4">
                                    {Object.entries(permissions).map(
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
                                                            <div className="mb-4 flex gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleSelectAll(
                                                                            groupKey,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isAllSelected
                                                                    }
                                                                >
                                                                    Select All
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleClearAll(
                                                                            groupKey,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !isAllSelected &&
                                                                        !isPartiallySelected
                                                                    }
                                                                >
                                                                    Clear All
                                                                </Button>
                                                            </div>
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
                                                                                checked={data.permissions.includes(
                                                                                    permission.name,
                                                                                )}
                                                                                onCheckedChange={(
                                                                                    checked,
                                                                                ) =>
                                                                                    handlePermissionChange(
                                                                                        permission.name,
                                                                                        checked as boolean,
                                                                                    )
                                                                                }
                                                                            />
                                                                            <Label
                                                                                htmlFor={
                                                                                    permission.name
                                                                                }
                                                                                className="cursor-pointer text-sm font-normal"
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

                                    {errors.permissions && (
                                        <p className="text-sm text-red-600">
                                            {errors.permissions}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Section */}
                    <div className="flex items-center justify-end gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Role'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
