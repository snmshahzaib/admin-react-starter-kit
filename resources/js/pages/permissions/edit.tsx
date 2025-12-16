import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import permissions from '@/routes/permissions';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import CreatableSelect from 'react-select/creatable';
import Swal from 'sweetalert2';

interface EditPermissionProps extends PageProps {
    permission: {
        id: number;
        name: string;
        label: string;
        group: string;
    };
    existingGroups: string[];
}

export default function EditPermission({
    permission,
    existingGroups,
}: EditPermissionProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name,
        label: permission.label,
        group: permission.group,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Permissions',
            href: '/permissions',
        },
        {
            title: permission.label,
            href: `/permissions/${permission.id}`,
        },
        {
            title: 'Edit Permission',
            href: `/permissions/${permission.id}/edit`,
        },
    ];

    // Create options for CreatableSelect
    const groupOptions = existingGroups.map((group) => ({
        value: group,
        label: group.charAt(0).toUpperCase() + group.slice(1),
    }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        put(permissions.update.url(permission.id), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Permission has been updated successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                    timerProgressBar: true,
                });
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while updating the permission.',
                    icon: 'error',
                    confirmButtonColor: '#3b82f6',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Permission: ${permission.label}`} />

            <div className="space-y-6 px-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Edit Permission: {permission.label}
                        </h1>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Permission Details Section */}
                    <Card>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">
                                        Permission Name{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="e.g., users.create, posts.edit"
                                        className={
                                            errors.name ? 'border-red-500' : ''
                                        }
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Use lowercase with dots (e.g.,
                                        users.create, posts.edit)
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="label">
                                        Display Label{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="label"
                                        type="text"
                                        value={data.label}
                                        onChange={(e) =>
                                            setData('label', e.target.value)
                                        }
                                        placeholder="e.g., Create Users, Edit Posts"
                                        className={
                                            errors.label ? 'border-red-500' : ''
                                        }
                                    />
                                    {errors.label && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.label}
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Human-readable label for the permission
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="group">
                                        Permission Group{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <CreatableSelect
                                        id="group"
                                        options={groupOptions}
                                        value={
                                            data.group
                                                ? {
                                                      value: data.group,
                                                      label:
                                                          data.group
                                                              .charAt(0)
                                                              .toUpperCase() +
                                                          data.group.slice(1),
                                                  }
                                                : null
                                        }
                                        onChange={(selectedOption) => {
                                            setData(
                                                'group',
                                                selectedOption?.value || '',
                                            );
                                        }}
                                        onCreateOption={(inputValue) => {
                                            setData(
                                                'group',
                                                inputValue.toLowerCase(),
                                            );
                                        }}
                                        placeholder="Select or create a group..."
                                        isClearable
                                        formatCreateLabel={(inputValue) =>
                                            `Create "${inputValue}"`
                                        }
                                        unstyled
                                        classNames={{
                                            control: () =>
                                                errors.group
                                                    ? 'px-3 border border-red-500 rounded-lg shadow-sm hover:border-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white dark:bg-neutral-800 dark:border-neutral-700'
                                                    : 'px-3 border border-sidebar-border rounded-lg shadow-sm hover:border-sidebar-border focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-neutral-800 dark:border-neutral-700',
                                            input: () =>
                                                'text-sm h-12 text-neutral-900 dark:text-neutral-100',
                                            menu: () =>
                                                'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-lg mt-1 rounded-lg',
                                            option: ({
                                                isFocused,
                                                isSelected,
                                            }) =>
                                                `px-3 py-2 text-sm cursor-pointer text-neutral-900 dark:text-neutral-100 ${
                                                    isFocused
                                                        ? 'bg-primary-lite dark:bg-neutral-700 text-primary dark:text-neutral-100'
                                                        : ''
                                                } ${isSelected ? 'bg-primary dark:bg-neutral-600 text-white' : ''}`,
                                            placeholder: () =>
                                                'text-primary-dark dark:text-neutral-400 text-sm',
                                            singleValue: () =>
                                                'text-sm text-primary-dark dark:text-neutral-100',
                                        }}
                                    />
                                    {errors.group && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.group}
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Select an existing group or type to
                                        create a new one
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Section */}
                    <div className="flex items-center justify-end gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Permission'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
