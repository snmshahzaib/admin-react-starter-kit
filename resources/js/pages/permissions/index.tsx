import { Button } from '@/components/ui/button';
import DataTable, {
    DataTableColumn,
    createActionDropdown,
} from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import permissions from '@/routes/permissions';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';

interface PermissionsIndexProps extends PageProps {
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
    };
}

export default function PermissionsIndex({ can }: PermissionsIndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Permissions',
            href: '/permissions',
        },
    ];

    // Define columns for the DataTable
    const columns: DataTableColumn[] = [
        {
            data: 'id',
            name: 'id',
            title: '#',
            width: '80px',
            className: 'text-center',
            render: function (_data: unknown, _type: string, _row: Record<string, unknown>, meta: { row: number }) {
                return `<span class="text-neutral-900 dark:text-white font-medium">${meta.row + 1}</span>`;
            },
        },
        {
            data: 'name',
            name: 'name',
            title: 'Name',
            orderable: true,
            searchable: true,
        },
        {
            data: 'label',
            name: 'label',
            title: 'Label',
            orderable: true,
            searchable: true,
        },
        {
            data: 'group',
            name: 'group',
            title: 'Group',
            orderable: true,
            searchable: true,
        },
        {
            data: 'action',
            name: 'action',
            title: 'Actions',
            orderable: false,
            searchable: false,
            className: 'w-32',
            render: function (data: Array<{ type: string; label: string; route: string; icon?: string }>) {
                if (!data || data.length === 0) {
                    return '<span class="text-gray-400">-</span>';
                }
                return createActionDropdown(data, 0);
            },
        },
    ];

    // Handle custom actions (delete confirmations, etc.)
    const handleCustomAction = async (
        actionType: string,
        rowId: string | number,
        actionUrl?: string,
    ) => {
        if (actionType === 'delete' && actionUrl) {
            // Prevent multiple calls by checking if we're already processing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((window as any).deletingPermission) {
                return;
            }

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
                    backdrop: true,
                    allowOutsideClick: false,
                });

                if (result.isConfirmed) {
                    // Set flag to prevent duplicate calls
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (window as any).deletingPermission = true;

                    // Show loading
                    Swal.fire({
                        title: 'Deleting...',
                        text: 'Please wait while we delete the permission.',
                        icon: 'info',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        },
                    });

                    // Use fetch with CSRF token for JSON response
                    try {
                        const csrfToken = document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content');

                        if (!csrfToken) {
                            Swal.fire({
                                title: 'Error!',
                                text: 'CSRF token not found. Please refresh the page and try again.',
                                icon: 'error',
                            });
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (window as any).deletingPermission = false;
                            return;
                        }

                        const response = await fetch(actionUrl, {
                            method: 'DELETE',
                            headers: {
                                'X-CSRF-TOKEN': csrfToken,
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                            },
                        });

                        if (!response.ok) {
                            throw new Error(
                                `HTTP error! status: ${response.status}`,
                            );
                        }

                        const data = await response.json();

                        if (data.success) {
                            Swal.fire({
                                title: 'Deleted!',
                                text: 'The permission has been deleted successfully.',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false,
                            }).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text:
                                    data.message ||
                                    'Failed to delete the permission.',
                                icon: 'error',
                            });
                        }
                    } catch (error: unknown) {
                        console.error('Error:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        Swal.fire({
                            title: 'Error!',
                            text:
                                'An error occurred while deleting the permission: ' +
                                errorMessage,
                            icon: 'error',
                        });
                    } finally {
                        // Clear the flag
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (window as any).deletingPermission = false;
                    }
                }
            } catch (error) {
                console.error('SweetAlert error:', error);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).deletingPermission = false;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).deletingPermission = false;
            }
        }
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Permissions Management" />

                <div className="space-y-6 px-6 pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Permissions Management
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Manage system permissions and access controls
                            </p>
                        </div>
                        {can.create && (
                            <Link href={permissions.create.url()}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Permission
                                </Button>
                            </Link>
                        )}
                    </div>

                    <DataTable
                        columns={columns}
                        dataUrl={permissions.data.url()}
                        tableId="permissions-table"
                        customActions={{
                            enable: true,
                            handler: handleCustomAction,
                        }}
                    />
                </div>
            </AppLayout>
        </>
    );
}
