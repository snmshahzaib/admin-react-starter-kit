import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import users from '@/routes/users';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface Role {
    id: number;
    name: string;
}

interface EditUserProps extends PageProps {
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        status: number;
        email_verified: boolean;
        role: number | null;
    };
    roles: Role[];
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
        title: 'Edit User',
        href: '/users/edit',
    },
];

export default function EditUser({ user, roles }: EditUserProps) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: '',
        password_confirmation: '',
        status: user.status,
        email_verified: user.email_verified,
        role: user.role,
    });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        put(users.update.url(user.id), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'User has been updated successfully.',
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
                    text: 'An error occurred while updating the user.',
                    icon: 'error',
                    confirmButtonColor: '#3b82f6',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <div className="space-y-6 px-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Edit User
                        </h1>
                        <p className="text-muted-foreground">
                            Update user information and settings
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="first_name">
                                        First Name{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) =>
                                            setData(
                                                'first_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter first name"
                                        className={cn(
                                            errors.first_name &&
                                                'border-red-500',
                                        )}
                                    />
                                    {errors.first_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.first_name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="last_name">
                                        Last Name{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) =>
                                            setData('last_name', e.target.value)
                                        }
                                        placeholder="Enter last name"
                                        className={cn(
                                            errors.last_name &&
                                                'border-red-500',
                                        )}
                                    />
                                    {errors.last_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.last_name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="email">
                                    Email Address{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="Enter email address"
                                    className={cn(
                                        errors.email && 'border-red-500',
                                    )}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="password">
                                        New Password (leave blank to keep
                                        current)
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="Enter new password"
                                        className={cn(
                                            errors.password && 'border-red-500',
                                        )}
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="password_confirmation">
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Confirm new password"
                                        className={cn(
                                            errors.password_confirmation &&
                                                'border-red-500',
                                        )}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="status">
                                    Status{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.status.toString()}
                                    onValueChange={(value) =>
                                        setData('status', parseInt(value))
                                    }
                                >
                                    <SelectTrigger
                                        className={cn(
                                            errors.status && 'border-red-500',
                                        )}
                                    >
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="0">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.status}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="email_verified"
                                    checked={data.email_verified}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'email_verified',
                                            checked as boolean,
                                        )
                                    }
                                />
                                <Label htmlFor="email_verified">
                                    Email verified
                                </Label>
                            </div>
                            <div>
                                <Label htmlFor="role">
                                    Role <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.role?.toString() || ''}
                                    onValueChange={(value) =>
                                        setData(
                                            'role',
                                            value ? parseInt(value) : null,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        className={cn(
                                            errors.role && 'border-red-500',
                                        )}
                                    >
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.id.toString()}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.role}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <a href={users.index.url()}>Cancel</a>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update User'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
