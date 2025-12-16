import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { Input } from './input';
import { Loader2 } from 'lucide-react';

// Type definitions for DataTable props
export interface DataTableColumn {
    data: string;
    name: string;
    title: string;
    width?: string;
    className?: string;
    orderable?: boolean;
    searchable?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render?: (data: any, type: any, row: any, meta: any) => string;
}

export interface DataTableFilter {
    key: string;
    label: string;
    count?: number | null;
}

export interface DataTableProps {
    columns: DataTableColumn[];
    dataUrl: string;
    tableId?: string;
    className?: string;
    filterTabs?: DataTableFilter[];
    pageLength?: number;
    searchable?: boolean;
    lengthChange?: boolean;
    info?: boolean;
    paging?: boolean;
    ordering?: boolean;
    onFilterChange?: (filter: string) => void;
    onRowClick?: (row: Record<string, unknown>) => void;
    onDataLoaded?: () => void;
    customActions?: {
        enable: boolean;
        handler?: (actionType: string, rowId: string | number, actionUrl?: string) => void;
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JQuery = any;

declare global {
    interface Window {
        jQuery: JQuery;
        $: JQuery;
    }
}

export default function DataTable({
    columns,
    dataUrl,
    tableId = 'data-table',
    className = '',
    filterTabs,
    pageLength = 10,
    searchable = true,
    lengthChange = true,
    info = true,
    paging = true,
    ordering = true,
    onFilterChange,
    onRowClick,
    onDataLoaded,
    customActions = { enable: false }
}: DataTableProps) {
    const tableRef = useRef<HTMLTableElement>(null);
    const [activeFilter, setActiveFilter] = useState(filterTabs?.[0]?.key || 'all');
    const currentFilterRef = useRef(filterTabs?.[0]?.key || 'all');
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = (filterKey: string) => {
        setActiveFilter(filterKey);
        currentFilterRef.current = filterKey; // Update ref immediately
        if (onFilterChange) {
            onFilterChange(filterKey);
        }

        // Reload DataTable with new filter
        if (window.jQuery && tableRef.current && isInitialized) {
            const $ = window.jQuery;
            const table = $(tableRef.current).DataTable();
            setIsLoading(true);
            table.ajax.reload(() => {
                setIsLoading(false);
            });
        }
    };

    useEffect(() => {
        // Initialize DataTable
        if (typeof window !== 'undefined' && window.jQuery && tableRef.current && !isInitialized) {
            const $ = window.jQuery;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dataTableConfig: any = {
                processing: true,
                serverSide: true,
                ajax: {
                    url: dataUrl,
                    type: 'GET',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data: function (d: any) {
                        // Add current filter to request - use ref for immediate value
                        d.filter = currentFilterRef.current;
                        return d;
                    },
                    beforeSend: function () {
                        setIsLoading(true);
                    },
                    complete: function () {
                        setIsLoading(false);
                    },
                    error: function () {
                        setIsLoading(false);
                    },
                },
                columns: columns,
                pageLength: pageLength,
                responsive: true,
                order: [[0, 'desc']],
                searching: searchable,
                lengthChange: lengthChange,
                info: info,
                paging: paging,
                ordering: ordering,
                dom: 't',
                language: {
                    processing: "Loading data...",
                    emptyTable: "No data available",
                    info: "Showing _START_ to _END_ of _TOTAL_ entries",
                    infoEmpty: "Showing 0 to 0 of 0 entries",
                    lengthMenu: "Show _MENU_ entries",
                    search: "Search:",
                    searchPlaceholder: "Search",
                    paginate: {
                        first: "First",
                        last: "Last",
                        next: "Next",
                        previous: "Previous"
                    }
                },
                initComplete: function () {
                    const table = this.api();

                    // Apply Tailwind classes to tbody cells
                    $(tableRef.current).find('tbody td').addClass('p-4 border-r border-b text-sm text-neutral-700 dark:text-neutral-200 bg-transparent').css({
                        'height': '45px',
                        'border-width': '1px'
                    });

                    // Apply right border color only to non-last-child cells
                    $(tableRef.current).find('tbody td:not(:last-child)').css({
                        'border-right-color': 'rgb(115 115 115 / 0.2)'
                    });

                    // Apply bottom border color only to non-last-row cells
                    $(tableRef.current).find('tbody tr:not(:last-child) td').css({
                        'border-bottom-color': 'rgb(115 115 115 / 0.2)'
                    });

                    $(tableRef.current).find('tbody td:last-child').removeClass('border-r');
                    $(tableRef.current).find('tbody tr:last-child td').removeClass('border-b');
                    $(tableRef.current).find('tbody tr:last-child td:first-child').addClass('rounded-bl-md');
                    $(tableRef.current).find('tbody tr:last-child td:last-child').addClass('rounded-br-md');

                    // Custom length change handler
                    $(`#${tableId}_length_select`).on('change', function (this: HTMLSelectElement) {
                        table.page.len(parseInt($(this).val() as string)).draw();
                        updateInfo();
                    });

                    // Custom search handler
                    $(`#${tableId}_search_input`).on('keyup', function (this: HTMLInputElement) {
                        table.search($(this).val() as string).draw();
                        updateInfo();
                    });

                    // Setup dropdown event handlers
                    setupDropdownHandlers();

                    // Initial info and pagination setup
                    updateInfo();
                    updatePagination();

                    // Call onDataLoaded callback when table is initialized and data is loaded
                    if (onDataLoaded) {
                        onDataLoaded();
                    }

                    // Update on table draw
                    table.on('draw', function () {
                        // Reapply Tailwind classes after each draw
                        $(tableRef.current).find('tbody td').addClass('p-4 border-r border-b text-sm text-neutral-700 dark:text-neutral-200 bg-transparent').css({
                            'height': '45px',
                            'border-width': '1px'
                        });

                        // Apply right border color only to non-last-child cells
                        $(tableRef.current).find('tbody td:not(:last-child)').css({
                            'border-right-color': 'rgb(115 115 115 / 0.2)'
                        });

                        // Apply bottom border color only to non-last-row cells
                        $(tableRef.current).find('tbody tr:not(:last-child) td').css({
                            'border-bottom-color': 'rgb(115 115 115 / 0.2)'
                        });

                        // Add dark mode classes to tbody cells
                        $(tableRef.current).find('tbody td').addClass('dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-800');

                        $(tableRef.current).find('tbody td:last-child').removeClass('border-r');
                        $(tableRef.current).find('tbody tr:last-child td').removeClass('border-b');
                        $(tableRef.current).find('tbody tr:hover td').addClass('bg-neutral-50 dark:bg-neutral-800');

                        updateInfo();
                        updatePagination();
                    });


                    function setupDropdownHandlers() {
                        // Capture router in closure for jQuery event handlers
                        const inertiaRouter = router;

                        // Setup dropdown toggles
                         
                        $(document).off('click.datatable-dropdown').on('click.datatable-dropdown', '[data-dropdown]', function (this: HTMLElement, e: Event) {
                            e.preventDefault();
                            e.stopPropagation();

                            const dropdownId = $(this).data('dropdown');
                            const dropdown = $(`#${dropdownId}`);
                            const cloneId = dropdownId + '_clone';
                            const existingClone = $(`#${cloneId}`);
                            const isCurrentlyOpen = existingClone.length > 0;

                            // Close all dropdowns first
                            $('.dropdown-clone').remove();
                            $('.action-dropdown-menu').addClass('hidden');

                            // If it wasn't open, open it now (toggle behavior)
                            if (!isCurrentlyOpen) {
                                // Move dropdown to body to avoid clipping
                                const buttonRect = this.getBoundingClientRect();
                                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

                                // Clone dropdown and append to body
                                const dropdownClone = dropdown.clone(true); // true = clone with events

                                dropdownClone.css({
                                    'position': 'absolute',
                                    'top': (buttonRect.bottom + scrollTop + 4) + 'px',
                                    'left': (buttonRect.right + scrollLeft - 192) + 'px', // 192px = w-48
                                    'z-index': '9999'
                                }).removeClass('hidden').attr('id', cloneId).addClass('dropdown-clone');

                                $('body').append(dropdownClone);
                            }
                        });

                        // Close dropdowns when clicking outside
                        $(document).off('click.datatable-dropdown-close').on('click.datatable-dropdown-close', function (e: Event) {
                            if (!$(e.target).closest('[data-dropdown], .action-dropdown-menu').length) {
                                $('.dropdown-clone').remove();
                                $('.action-dropdown-menu').addClass('hidden');
                            }
                        });

                        // Handle all actions (view, edit, delete, etc.)
                         
                        $(document).off('click.datatable-action').on('click.datatable-action', '[data-action]', function (this: HTMLElement, e: Event) {
                            e.preventDefault();
                            e.stopPropagation();

                            // Prevent double execution
                            if ($(this).data('processing')) {
                                return;
                            }
                            $(this).data('processing', true);

                            const actionType = $(this).data('action');
                            const actionId = $(this).data('id');
                            const actionUrl = $(this).data('url');

                            // Close dropdown immediately
                            $('.dropdown-clone').remove();
                            $('.action-dropdown-menu').addClass('hidden');

                            // Handle navigation actions (view, edit) with Inertia
                            if (actionType === 'view' || actionType === 'edit') {
                                inertiaRouter.visit(actionUrl);
                            }
                            // Handle custom actions (delete, etc.) with custom handler
                            else if (customActions?.enable && customActions?.handler) {
                                customActions.handler(actionType, actionId, actionUrl);
                            }

                            // Reset processing flag after a delay
                            setTimeout(() => {
                                $(this).data('processing', false);
                            }, 1000);
                        });
                    }

                    function updateInfo() {
                        const info = table.page.info();
                        if (!info) {
                            return; // DataTable not ready yet
                        }
                        const infoText = info.recordsTotal === 0 ?
                            'Showing 0 to 0 of 0 entries' :
                            `Showing ${info.start + 1} to ${info.end} of ${info.recordsTotal} entries`;
                        $(`#${tableId}_info`).text(infoText);
                    }

                    function updatePagination() {
                        const info = table.page.info();
                        if (!info) {
                            return; // DataTable not ready yet
                        }
                        const pagination = $(`#${tableId}_paginate`);
                        pagination.empty();

                        // Always show pagination, even for single page
                        const totalPages = Math.max(1, info.pages); // Ensure at least 1 page

                        // Previous button with icon
                        const prevBtn = $(`<button class="${info.page === 0 ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-border' : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'} rounded border px-3 py-2 text-sm font-medium cursor-pointer mx-0.5" data-page="prev">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>`);
                        pagination.append(prevBtn);

                        // Page numbers
                        for (let i = 0; i < totalPages; i++) {
                            const pageBtn = $(`<button class="${i === info.page ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-accent'} rounded border px-3 py-2 text-sm font-medium cursor-pointer mx-0.5" data-page="${i}">${i + 1}</button>`);
                            pagination.append(pageBtn);
                        }

                        // Next button with icon
                        const nextBtn = $(`<button class="${info.page === totalPages - 1 ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-border' : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'} rounded border px-3 py-2 text-sm font-medium cursor-pointer mx-0.5" data-page="next">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>`);
                        pagination.append(nextBtn);

                        // Pagination click handlers
                         
                        pagination.find('button').on('click', function (this: HTMLElement) {
                            const page = $(this).data('page');
                            if ($(this).hasClass('opacity-50')) return; // Don't handle disabled buttons

                            if (page === 'prev' && info.page > 0) {
                                table.page('previous').draw('page');
                            } else if (page === 'next' && info.page < totalPages - 1) {
                                table.page('next').draw('page');
                            } else if (typeof page === 'number' && page !== info.page) {
                                table.page(page).draw('page');
                            }
                        });
                    }
                }
            };

            const table = $(tableRef.current).DataTable(dataTableConfig);
            setIsInitialized(true);

            // Handle dropdown toggles if custom actions are enabled
            if (customActions.enable) {
                 
                $(document).on('click', '.action-dropdown-toggle', function (this: HTMLElement, e: Event) {
                    e.preventDefault();
                    e.stopPropagation();

                    const dropdownId = $(this).data('dropdown');
                    const dropdown = $(`#${dropdownId}`);

                    // Close all other dropdowns
                    $('.action-dropdown-menu').addClass('hidden');

                    // Toggle current dropdown
                    dropdown.toggleClass('hidden');
                });

                // Close dropdowns when clicking outside
                $(document).on('click', function (e: Event) {
                    if (!$(e.target).closest('.action-dropdown-toggle, .action-dropdown-menu').length) {
                        $('.action-dropdown-menu').addClass('hidden');
                    }
                });

                // Handle custom actions
                if (customActions.handler) {
                     
                    $(document).on('click', '[data-action]', function (this: HTMLElement, e: Event) {
                        e.preventDefault();
                        const actionType = $(this).data('action');
                        const rowId = $(this).data('id');
                        const actionUrl = $(this).data('url');

                        customActions.handler!(actionType, rowId, actionUrl);
                    });
                }
            }

            // Handle row clicks
            if (onRowClick) {
                 
                $(tableRef.current).on('click', 'tbody tr', function (this: HTMLElement) {
                    const data = table.row(this).data();
                    onRowClick(data);
                });
            }
        }

        return () => {
            // Cleanup DataTable on unmount
            if (typeof window !== 'undefined' && window.jQuery && tableRef.current && isInitialized) {
                const $ = window.jQuery;
                if ($.fn.DataTable.isDataTable(tableRef.current)) {
                    $(tableRef.current).DataTable().destroy();
                    setIsInitialized(false);
                }
            }
        };
    }, [dataUrl, activeFilter]);

    return (
        <Card className={`${className} overflow-visible py-0`}>
            {/* Custom Card Header with Controls */}
            <div className="px-6 py-4 border-b border-border bg-muted rounded-t-xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Custom Length Control */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                            <span>Show</span>
                            <select
                                id={`${tableId}_length_select`}
                                className="border border-input rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                defaultValue="10"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span>entries</span>
                        </div>
                    </div>

                    {/* Custom Search Control */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Input
                            type="text"
                            id={`${tableId}_search_input`}
                            placeholder="Search"
                            className="min-w-0 flex-1 max-w-xs"
                        />
                    </div>
                </div>
            </div>

            <CardContent>

                {/* Filter Tabs */}
                {filterTabs && filterTabs.length > 0 && (
                    <div className="overflow-x-auto mb-4">
                        <div className="flex gap-3 min-w-max pb-2">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleFilterChange(tab.key)}
                                    className={`px-14 py-2 rounded-full text-sm font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${activeFilter === tab.key
                                            ? 'bg-primary/60 text-primary-foreground border-primary'
                                            : 'bg-transparent text-muted-foreground border-border hover:bg-primary/60'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Responsive DataTable Container */}
                <div className="relative" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <div className="min-w-full inline-block align-middle">
                            <div className="overflow-hidden rounded-lg border-1" style={{ borderColor: '#17003B66' }}>
                                <table
                                    ref={tableRef}
                                    id={tableId}
                                    className="w-full table-auto min-w-full"
                                    style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
                                >
                                <thead>
                                    <tr>
                                        {columns.map((column, index) => (
                                            <th
                                                key={index}
                                                style={{
                                                    width: column.width || 'auto',
                                                    borderRightColor: '#17003B66',
                                                    height: '40px'
                                                }}
                                                className={`bg-muted p-4 text-left text-sm font-semibold text-foreground ${index === 0 ? 'rounded-tl-md' : ''
                                                    } ${index === columns.length - 1 ? 'rounded-tr-md' : 'border-r border-border'
                                                    }`}
                                            >
                                                {column.title}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* DataTable will populate this */}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            {/* Custom Footer with Info and Pagination */}
            <div className="px-6 py-4 border-t border-border bg-muted rounded-b-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div id={`${tableId}_info`} className="text-sm text-muted-foreground whitespace-nowrap">
                        {/* DataTable info will be inserted here */}
                    </div>
                    <div id={`${tableId}_paginate`} className="flex gap-1 flex-wrap justify-center sm:justify-end overflow-x-auto">
                        {/* DataTable pagination will be inserted here */}
                    </div>
                </div>
            </div>
        </Card>
    );
}

// Helper function to create action dropdown HTML
export function createActionDropdown(actions: Array<{ type: string, label: string, route: string, icon?: string }>, rowId: string | number): string {
    if (!actions || actions.length === 0) {
        return '<span class="text-muted-foreground">-</span>';
    }

    const dropdownId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
    let actionsHtml = `
        <div class="relative inline-block text-left" style="position: relative;">
            <button type="button" class="inline-flex items-center justify-center w-8 h-8 text-foreground focus:outline-none rounded-md bg-muted hover:bg-accent" style="border: 1px solid var(--border);" data-dropdown="${dropdownId}">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                </svg>
            </button>
            <div id="${dropdownId}" class="action-dropdown-menu hidden absolute right-0 mt-1 w-48 bg-popover rounded-lg shadow-xl" style="z-index: 99999; border: 1px solid var(--border);">
                <div class="py-1">
    `;

    actions.forEach((action, index) => {
        const iconHtml = action.icon || getDefaultIcon(action.type);
        const colorClass = action.type === 'delete' ? 'text-destructive hover:bg-destructive/10' : 'text-foreground hover:bg-accent';
        const borderClass = index !== actions.length - 1 ? 'border-b' : '';
        const itemStyle = index !== actions.length - 1 ? 'border-bottom: 1px solid var(--border);' : '';

        if (action.type === 'delete') {
            actionsHtml += `<button type="button" class="flex items-center w-full px-4 py-2 text-sm ${colorClass} ${borderClass}" style="${index !== actions.length - 1 ? itemStyle : ''}" data-action="${action.type}" data-id="${rowId}" data-url="${action.route}">${iconHtml}${action.label}</button>`;
        } else {
            // Use button with data attributes for Inertia navigation
            actionsHtml += `<button type="button" class="flex items-center w-full px-4 py-2 text-sm ${colorClass} ${borderClass}" style="${index !== actions.length - 1 ? itemStyle : ''}" data-action="${action.type}" data-id="${rowId}" data-url="${action.route}">${iconHtml}${action.label}</button>`;
        }
    });

    actionsHtml += `
                </div>
            </div>
        </div>
    `;

    return actionsHtml;
}

// Helper function to get default icons for common actions
function getDefaultIcon(actionType: string): string {
    const icons: Record<string, string> = {
        edit: '<svg class="w-4 h-4 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>',
        delete: '<svg class="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>',
        view: '<svg class="w-4 h-4 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>',
        download: '<svg class="w-4 h-4 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
        activate: '<svg class="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
        deactivate: '<svg class="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    };

    return icons[actionType] || '<svg class="w-4 h-4 mr-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>';
}

// Helper function to create status badge
export function createStatusBadge(status: string, variant: 'success' | 'warning' | 'danger' | 'info' = 'success'): string {
    const variants = {
        success: 'bg-green-50 text-green-700 border border-green-200',
        warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        danger: 'bg-red-50 text-red-700 border border-red-200',
        info: 'bg-blue-50 text-blue-700 border border-blue-200'
    };

    return `<span class="inline-flex items-center rounded-sm px-3 py-1 text-sm font-medium ${variants[variant]}">${status}</span>`;
}