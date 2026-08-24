import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BookMarked, Search, ChevronDown, ChevronRight, FileText } from 'lucide-react';

export default function Index({ journals }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRows, setExpandedRows] = useState({});

    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const filteredJournals = journals.filter(j => 
        j.journal_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
        j.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    };

    return (
        <AuthenticatedLayout header="Buku Jurnal Umum">
            <Head title="Jurnal Umum" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <BookMarked className="w-6 h-6 text-brand" />
                        Jurnal Umum (Core Ledger)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Daftar jurnal akuntansi yang terbentuk secara otomatis dari transaksi operasional BMT.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <Link href={route('journals.create')} className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                        Buat Jurnal Manual
                    </Link>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari No. Jurnal / Referensi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all dark:text-slate-200"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-4 w-10"></th>
                                <th className="px-6 py-4 font-semibold">Tanggal</th>
                                <th className="px-6 py-4 font-semibold">No. Jurnal</th>
                                <th className="px-6 py-4 font-semibold">Keterangan Jurnal</th>
                                <th className="px-6 py-4 font-semibold">Referensi</th>
                                <th className="px-6 py-4 font-semibold">Cabang</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredJournals.length > 0 ? (
                                filteredJournals.map(journal => (
                                    <React.Fragment key={journal.id}>
                                        <tr 
                                            onClick={() => toggleRow(journal.id)}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-4 py-4 text-slate-400 group-hover:text-brand transition-colors">
                                                {expandedRows[journal.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                                {formatDate(journal.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50">
                                                    <FileText className="w-3 h-3" />
                                                    {journal.journal_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {journal.description}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">
                                                {journal.reference}
                                            </td>
                                            <td className="px-6 py-4">
                                                {journal.branch ? journal.branch.name : 'Pusat'}
                                            </td>
                                        </tr>
                                        {expandedRows[journal.id] && (
                                            <tr>
                                                <td colSpan="6" className="p-0 bg-slate-50/50 dark:bg-slate-900/50">
                                                    <div className="px-14 py-4 border-l-2 border-brand ml-4 my-2 rounded-r-lg bg-white dark:bg-slate-950 shadow-sm border border-slate-100 dark:border-slate-800">
                                                        <table className="w-full text-xs">
                                                            <thead className="text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                                                <tr>
                                                                    <th className="pb-2 font-medium text-left">Akun GL</th>
                                                                    <th className="pb-2 font-medium text-left">Nama Akun</th>
                                                                    <th className="pb-2 font-medium text-left">Keterangan Detail</th>
                                                                    <th className="pb-2 font-medium text-right">Debit (Rp)</th>
                                                                    <th className="pb-2 font-medium text-right">Kredit (Rp)</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                                                                {journal.lines.map((line, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="py-2.5 font-mono text-slate-600 dark:text-slate-400">{line.gl_account ? line.gl_account.account_number : '-'}</td>
                                                                        <td className="py-2.5 font-medium text-slate-800 dark:text-slate-300">{line.gl_account ? line.gl_account.name : '-'}</td>
                                                                        <td className="py-2.5 text-slate-500">{line.description}</td>
                                                                        <td className="py-2.5 text-right font-semibold text-emerald-600">{Number(line.debit) > 0 ? formatCurrency(line.debit) : '-'}</td>
                                                                        <td className="py-2.5 text-right font-semibold text-amber-600">{Number(line.credit) > 0 ? formatCurrency(line.credit) : '-'}</td>
                                                                    </tr>
                                                                ))}
                                                                {/* Total Row */}
                                                                <tr className="bg-slate-50 dark:bg-slate-900">
                                                                    <td colSpan="3" className="py-2.5 font-bold text-right text-slate-700 dark:text-slate-300">TOTAL:</td>
                                                                    <td className="py-2.5 font-bold text-right text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700">
                                                                        {formatCurrency(journal.lines.reduce((sum, line) => sum + Number(line.debit), 0))}
                                                                    </td>
                                                                    <td className="py-2.5 font-bold text-right text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700">
                                                                        {formatCurrency(journal.lines.reduce((sum, line) => sum + Number(line.credit), 0))}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <BookMarked className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                                            <p>Belum ada jurnal akuntansi yang terbentuk.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
