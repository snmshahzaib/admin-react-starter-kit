import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Edit, Mail, Shield, Trash2, User } from 'lucide-react';

interface Permission {
    name: string;
    label: string;
    group: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Record<string, Permission[]>;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: number;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    two_factor_enabled: boolean;
    roles: Role[];
}

interface ShowUserProps extends PageProps {
    user: User;
    can: {
        edit: boolean;
        delete: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'User Details',
        href: '/users/show',
    },
];

export default function ShowUser({ user, can }: ShowUserProps) {
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = users.destroy.url(user.id);

            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'DELETE';

            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') || '';

            form.appendChild(methodInput);
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.first_name} ${user.last_name}`} />

            <div className="space-y-6 px-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {user.first_name} {user.last_name}
                        </h1>
                        <p className="text-muted-foreground">
                            User account details and information
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        {can.edit && (
                            <Button asChild>
                                <Link href={users.edit.url(user.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit User
                                </Link>
                            </Button>
                        )}
                        {can.delete && (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* User Information */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-2 h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            First Name
                                        </label>
                                        <p className="text-sm font-medium">
                                            {user.first_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Last Name
                                        </label>
                                        <p className="text-sm font-medium">
                                            {user.last_name}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Email Address
                                    </label>
                                    <p className="flex items-center text-sm font-medium">
                                        <Mail className="mr-2 h-4 w-4" />
                                        {user.email}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        <Badge
                                            variant={
                                                user.status == 1
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {user.status == 1
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Role and Permissions */}
                        {user.roles && user.roles.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="mr-2 h-5 w-5" />
                                        Role & Permissions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {user.roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="space-y-3"
                                        >
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Role
                                                </label>
                                                <div className="mt-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-sm"
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {Object.keys(role.permissions)
                                                .length > 0 && (
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">
                                                        Permissions
                                                    </label>
                                                    <div className="mt-2 space-y-3">
                                                        {Object.entries(
                                                            role.permissions,
                                                        ).map(
                                                            ([
                                                                group,
                                                                permissions,
                                                            ]) => (
                                                                <div
                                                                    key={group}
                                                                >
                                                                    <h4 className="mb-2 text-sm font-medium text-foreground">
                                                                        {group}
                                                                    </h4>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {permissions.map(
                                                                            (
                                                                                permission,
                                                                            ) => (
                                                                                <Badge
                                                                                    key={
                                                                                        permission.name
                                                                                    }
                                                                                    variant="secondary"
                                                                                    className="text-xs"
                                                                                >
                                                                                    {
                                                                                        permission.label
                                                                                    }
                                                                                </Badge>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar Information */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Email Verification
                                    </label>
                                    <div className="mt-1">
                                        <Badge
                                            variant={
                                                user.email_verified_at
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                        >
                                            {user.email_verified_at
                                                ? 'Verified'
                                                : 'Unverified'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Two-Factor Authentication
                                    </label>
                                    <div className="mt-1">
                                        <Badge
                                            variant={
                                                user.two_factor_enabled
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {user.two_factor_enabled
                                                ? 'Enabled'
                                                : 'Disabled'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Created
                                    </label>
                                    <p className="text-sm">{user.created_at}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Last Updated
                                    </label>
                                    <p className="text-sm">{user.updated_at}</p>
                                </div>
                                {user.email_verified_at && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Email Verified
                                        </label>
                                        <p className="text-sm">
                                            {user.email_verified_at}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
