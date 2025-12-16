import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import permissions from '@/routes/permissions';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface Permission {
    id: number;
    name: string;
    label: string;
    group: string;
    created_at: string;
    updated_at: string;
}

interface PermissionShowProps extends PageProps {
    permission: Permission;
    can: {
        edit: boolean;
        delete: boolean;
    };
}

export default function PermissionShow({
    permission,
    can,
}: PermissionShowProps) {
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
    ];

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
                router.delete(permissions.destroy.url(permission.id), {
                    onSuccess: () => {
                        router.visit(permissions.index.url(), {
                            onSuccess: () => {
                                Swal.fire({
                                    title: 'Deleted!',
                                    text: 'The permission has been deleted successfully.',
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
                            text: 'An error occurred while deleting the permission.',
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
            <Head title={`Permission: ${permission.label}`} />

            <div className="space-y-6 px-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Permission: {permission.label}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {can.edit && (
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={permissions.edit.url(permission.id)}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Permission
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
                                Delete Permission
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Permission Details Section */}
                    <Card>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">
                                        Permission Name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={permission.name}
                                        disabled
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="label">Display Label</Label>
                                    <Input
                                        id="label"
                                        type="text"
                                        value={permission.label}
                                        disabled
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="group">
                                        Permission Group
                                    </Label>
                                    <div className="mt-2">
                                        <Badge
                                            variant="outline"
                                            className="text-primary-dark rounded-lg border border-primary bg-primary/10 text-sm"
                                        >
                                            {permission.group
                                                .charAt(0)
                                                .toUpperCase() +
                                                permission.group.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
