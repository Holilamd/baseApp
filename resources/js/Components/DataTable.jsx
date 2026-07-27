import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsUpDown, AlertCircle, RefreshCw } from 'lucide-react';

export default function DataTable({
    columns,
    data = [],
    meta = null,
    onPageChange,
    onSearch,
    searchValue = '',
    searchPlaceholder = 'Search records...',
    onSort,
    sortBy = '',
    sortDir = 'asc',
    loading = false,
}) {
    const [isFocused, setIsFocused] = useState(false);

    const handleSort = (column) => {
        if (!column.sortable || !onSort) return;
        const isAsc = sortBy === column.key && sortDir === 'asc';
        onSort(column.key, isAsc ? 'desc' : 'asc');
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-lg shadow-slate-100/50 dark:shadow-none overflow-hidden transition-all duration-300">
            
            {/* Table Actions Header */}
            {onSearch && (
                <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-950/10">
                    <div className="relative w-full sm:max-w-sm">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors duration-250 ${
                            isFocused ? 'text-brand' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                            {loading ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-brand" />
                            ) : (
                                <Search className="w-4.5 h-4.5" />
                            )}
                        </span>
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearch(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={searchPlaceholder}
                            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-glow focus:border-brand transition-all duration-250 shadow-sm"
                        />
                    </div>
                    {loading && (
                        <span className="text-[10px] font-bold text-brand uppercase tracking-wider animate-pulse">
                            Refreshing data...
                        </span>
                    )}
                </div>
            )}

            {/* Table Container */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-50/50 border-b border-slate-200/80 dark:text-slate-350 dark:bg-slate-950/20 dark:border-slate-800">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    onClick={() => handleSort(col)}
                                    className={`px-6 py-4 font-bold transition-all duration-200 select-none ${
                                        col.sortable 
                                            ? 'cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-850/60 text-slate-900 dark:text-white' 
                                            : 'text-slate-450 dark:text-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortable && onSort && (
                                            <span className={`transition-transform duration-200 ${sortBy === col.key ? 'text-brand scale-110' : 'text-slate-400 opacity-60'}`}>
                                                <ChevronsUpDown className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150/40 dark:divide-slate-800/40">
                        {loading && data.length === 0 ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={idx} className="animate-pulse bg-white dark:bg-slate-900">
                                    {columns.map((_, colIdx) => (
                                        <td key={colIdx} className="px-6 py-5">
                                            <div className="h-3.5 bg-slate-100 rounded-md dark:bg-slate-800 w-2/3"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto space-y-3">
                                        <div className="p-3.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No records found</p>
                                            <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1">We couldn't find any results matching your filters or search query.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIdx) => (
                                <tr 
                                    key={rowIdx} 
                                    className="bg-white hover:bg-slate-50/40 dark:bg-slate-900 dark:hover:bg-slate-850/20 transition-colors duration-200"
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4.5 text-slate-750 dark:text-slate-300 font-medium">
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
                <div className="p-5 bg-slate-50/20 dark:bg-slate-950/5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row gap-4 items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Showing <span className="font-bold text-slate-800 dark:text-white">{(meta.current_page - 1) * meta.per_page + 1}</span> to{' '}
                        <span className="font-bold text-slate-800 dark:text-white">
                            {Math.min(meta.current_page * meta.per_page, meta.total)}
                        </span>{' '}
                        of <span className="font-bold text-slate-800 dark:text-white">{meta.total}</span> entries
                    </span>

                    <div className="inline-flex gap-1">
                        {/* Prev Button */}
                        <button
                            disabled={meta.current_page === 1 || loading}
                            onClick={() => onPageChange(meta.current_page - 1)}
                            className="p-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center shadow-sm bg-white dark:bg-slate-900"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Page Numbers */}
                        {meta.links.filter(link => !isNaN(link.label)).map((link, idx) => (
                            <button
                                key={idx}
                                disabled={loading}
                                onClick={() => {
                                    if (onPageChange) {
                                        onPageChange(parseInt(link.label));
                                    }
                                }}
                                className={`w-8 h-8 flex items-center justify-center border text-xs font-bold rounded-xl transition-all duration-200 shadow-sm ${
                                    link.active
                                        ? 'bg-brand border-brand text-white shadow-brand/10'
                                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-750 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-350'
                                }`}
                            >
                                {link.label}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            disabled={meta.current_page === meta.last_page || loading}
                            onClick={() => onPageChange(meta.current_page + 1)}
                            className="p-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center shadow-sm bg-white dark:bg-slate-900"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
