import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Search, Loader2, CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import AsyncSelect from '@/Components/AsyncSelect';
import axios from 'axios';

export default function SavingsInquiry() {
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [inquiryData, setInquiryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Default: 1 month ago until today
    const [startDate, setStartDate] = useState(
        new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    useEffect(() => {
        if (!selectedAccountId) {
            setInquiryData(null);
            return;
        }

        setIsLoading(true);
        axios.get(`/api/inquiries/savings/${selectedAccountId}`, {
            params: { start_date: startDate, end_date: endDate }
        })
            .then(res => {
                setInquiryData(res.data);
            })
            .catch(err => {
                console.error("Failed to load inquiry data", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [selectedAccountId, startDate, endDate]);

    return (
        <AuthenticatedLayout header="Inquiry Tabungan (Mutasi)">
            <Head title="Inquiry Tabungan" />

            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Search Bar */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400" /> Cari Rekening Tabungan (Nomor / Nama)
                    </label>
                    <AsyncSelect
                        apiEndpoint="/api/search/savings"
                        value={selectedAccountId}
                        onChange={(val) => setSelectedAccountId(val)}
                        placeholder="Ketik Budi atau 001-10..."
                        valueKey="id"
                        displayKey="account_number"
                        renderOption={(option, isSelectedView) => {
                            if (isSelectedView) return `${option.account_number} - ${option.customer_name}`;
                            return (
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{option.account_number}</span>
                                    <span className="text-xs text-slate-500">{option.customer_name} (CIF: {option.cif_number})</span>
                                </div>
                            );
                        }}
                    />

                    {/* Date Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Mulai</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Tanggal Akhir</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <Loader2 className="w-8 h-8 text-brand animate-spin mb-4" />
                        <span className="text-slate-500">Memuat data inquiry...</span>
                    </div>
                ) : inquiryData ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Account Summary Card */}
                        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 shadow-lg shadow-brand/20 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-4 opacity-90">
                                        <CreditCard className="w-5 h-5" />
                                        <span className="font-medium tracking-wide uppercase text-sm">Rekening {inquiryData.account.product?.name}</span>
                                    </div>
                                    <h3 className="text-3xl font-bold font-mono tracking-wider mb-1">{inquiryData.account.account_number}</h3>
                                    <p className="text-brand-100 text-lg">{inquiryData.account.customer?.full_name} (CIF: {inquiryData.account.customer?.cif_number})</p>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-brand-200 text-sm mb-1">Saldo Tersedia</p>
                                    <h2 className="text-4xl font-bold">
                                        Rp {parseFloat(inquiryData.account.balance).toLocaleString('id-ID')}
                                    </h2>
                                    <div className="inline-flex mt-2 items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                                        Status: {inquiryData.account.status}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Histori Mutasi Terakhir</h3>
                                <a 
                                    href={route('inquiries.savings.print', { id: selectedAccountId, start_date: startDate, end_date: endDate })}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-brand/25"
                                >
                                    Cetak Mutasi (PDF)
                                </a>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                                    <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/50 text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Tanggal</th>
                                            <th className="px-6 py-4">Tipe</th>
                                            <th className="px-6 py-4">Keterangan</th>
                                            <th className="px-6 py-4 text-right">Debit</th>
                                            <th className="px-6 py-4 text-right">Kredit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {inquiryData.transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Belum ada transaksi.</td>
                                            </tr>
                                        ) : (
                                            inquiryData.transactions.map((trx, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(trx.created_at).toLocaleString('id-ID')}</td>
                                                    <td className="px-6 py-4">
                                                        {trx.transaction_type === 'DEPOSIT' ? (
                                                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                                                <ArrowDownRight className="w-4 h-4" /> Setor
                                                            </span>
                                                        ) : trx.transaction_type === 'WITHDRAWAL' ? (
                                                            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                                                                <ArrowUpRight className="w-4 h-4" /> Tarik
                                                            </span>
                                                        ) : (
                                                            <span className="font-medium text-slate-600">{trx.transaction_type}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">{trx.description}</td>
                                                    <td className="px-6 py-4 text-right font-mono text-rose-600 dark:text-rose-400">
                                                        {trx.transaction_type !== 'DEPOSIT' ? parseFloat(trx.amount).toLocaleString('id-ID') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                                                        {trx.transaction_type === 'DEPOSIT' ? parseFloat(trx.amount).toLocaleString('id-ID') : '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <Search className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-4" />
                        <span className="text-slate-500">Pilih rekening di atas untuk melihat mutasi.</span>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
