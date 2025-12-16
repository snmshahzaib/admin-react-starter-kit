import { Button } from '@/components/ui/button';
import DataTable, {
    DataTableColumn,
    createActionDropdown,
} from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import roles from '@/routes/roles';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';

interface RolesIndexProps extends PageProps {
    can: {
        create: boolean;
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
        title: 'Roles',
        href: '/roles',
    },
];

export default function RolesIndex({ can }: RolesIndexProps) {
    const handleDataLoaded = () => {
        // handle data loaded
    };

    // Define table columns for roles (#, name, actions)
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
            render: function (data: string) {
                return `<span class="text-neutral-900 dark:text-white font-medium capitalize">${data.replace('_', ' ')}</span>`;
            },
        },
        {
            data: 'permissions_count',
            name: 'permissions_count',
            title: 'Permissions',
            orderable: false,
            searchable: false,
            width: '120px',
            className: 'text-center',
            render: function (data: number) {
                return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted dark:bg-neutral-900 text-sidebar-accent-foreground">${data} permissions</span>`;
            },
        },
        {
            data: 'action',
            name: 'action',
            title: 'Actions',
            orderable: false,
            searchable: false,
            width: '100px',
            className: 'text-center',
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
            if ((window as any).deletingRole) {
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
                    (window as any).deletingRole = true;

                    // Show loading
                    Swal.fire({
                        title: 'Deleting...',
                        text: 'Please wait while we delete the role.',
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
                            (window as any).deletingRole = false;
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
                                text: 'The role has been deleted successfully.',
                                icon: 'success',
                                toast: true,
                                position: 'top-end',
                                timerProgressBar: true,
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
                                    'Failed to delete the role.',
                                icon: 'error',
                            });
                        }
                    } catch (error: unknown) {
                        console.error('Error:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        Swal.fire({
                            title: 'Error!',
                            text:
                                'An error occurred while deleting the role: ' +
                                errorMessage,
                            icon: 'error',
                        });
                    } finally {
                        // Clear the flag
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (window as any).deletingRole = false;
                    }
                }
            } catch (error) {
                console.error('SweetAlert error:', error);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).deletingRole = false;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).deletingRole = false;
            }
        }
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Roles Management" />

                <div className="py-6">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Roles Management
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage user roles and their permissions
                                </p>
                            </div>
                            {can.create && (
                                <Button asChild>
                                    <Link href={roles.create.url()}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Role
                                    </Link>
                                </Button>
                            )}
                        </div>

                        <DataTable
                            columns={columns}
                            dataUrl={roles.data.url()}
                            tableId="roles-table"
                            onDataLoaded={handleDataLoaded}
                            customActions={{
                                enable: true,
                                handler: handleCustomAction,
                            }}
                        />
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
