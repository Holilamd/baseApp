import React from 'react';

export default function DataTable({
    columns,
    data = [],
    meta = null,
    onPageChange,
    onSearch,
    searchValue = '',
    searchPlaceholder = 'Search...',
    onSort,
    sortBy = '',
    sortDir = 'asc',
    loading = false,
}) {
    const handleSort = (column) => {
        if (!column.sortable || !onSort) return;
        const isAsc = sortBy === column.key && sortDir === 'asc';
        onSort(column.key, isAsc ? 'desc' : 'asc');
    };

    return (
        <div className="w-full bg-white border border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Table Actions Header */}
            {onSearch && (
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:focus:ring-brand/20"
                        />
                    </div>
                </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-55/30 border-b border-slate-150 dark:text-slate-300 dark:bg-slate-800/40 dark:border-slate-800">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    onClick={() => handleSort(col)}
                                    className={`px-6 py-4 font-medium transition-colors select-none ${
                                        col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortable && onSort && (
                                            <span className="text-slate-400">
                                                {sortBy === col.key ? (
                                                    sortDir === 'asc' ? (
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                                                    ) : (
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                                    )
                                                ) : (
                                                    <svg className="w-3.5 h-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 10l5-5 5 5M7 14l5 5 5-5" /></svg>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={idx} className="animate-pulse bg-white dark:bg-slate-900">
                                    {columns.map((_, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded dark:bg-slate-800 w-2/3"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="w-12 h-12 text-slate-350 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0H4m16 0v1a3 3 0 01-3 3H7a3 3 0 01-3-3v-1" />
                                        </svg>
                                        <p className="text-slate-600 dark:text-slate-400 font-medium">No results found</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Try adjusting your search criteria</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => (
                                <tr 
                                    key={rowIdx} 
                                    className="bg-white hover:bg-slate-50/50 dark:bg-slate-900 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4 text-slate-800 dark:text-slate-300">
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {meta && meta.last_page > 1 && (
                <div className="p-5 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs">
                    <span className="text-slate-550 dark:text-slate-400">
                        Showing <span className="font-semibold text-slate-900 dark:text-white">{(meta.current_page - 1) * meta.per_page + 1}</span> to{' '}
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {Math.min(meta.current_page * meta.per_page, meta.total)}
                        </span>{' '}
                        of <span className="font-semibold text-slate-900 dark:text-white">{meta.total}</span> entries
                    </span>

                    <div className="inline-flex gap-1.5">
                        {meta.links.map((link, idx) => {
                            // Link label formatting for arrows
                            let label = link.label;
                            if (label.includes('Previous')) {
                                label = 'Prev';
                            } else if (label.includes('Next')) {
                                label = 'Next';
                            }

                            return (
                                <button
                                    key={idx}
                                    disabled={!link.url || loading}
                                    onClick={() => {
                                        if (link.url && onPageChange) {
                                            const urlObj = new URL(link.url);
                                            const page = urlObj.searchParams.get('page');
                                            onPageChange(parseInt(page));
                                        }
                                    }}
                                    className={`px-3 py-1.5 border text-xs font-semibold rounded-lg transition-all ${
                                        link.active
                                            ? 'bg-brand border-brand text-white shadow-sm shadow-brand/20'
                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300'
                                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
