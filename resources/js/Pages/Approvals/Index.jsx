import React from 'react';
import { usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import * as Icons from 'lucide-react';
import { formatCurrency } from '@/Utils/formatCurrency';

export default function ApprovalsIndex() {
    const { pendingTransactions } = usePage().props;
    const { post, processing } = useForm();

    const handleApprove = (id) => {
        if (confirm('Anda yakin ingin menyetujui transaksi ini? Jurnal akan otomatis dibuat.')) {
            post(route('approvals.approve', id));
        }
    };

    const handleReject = (id) => {
        if (confirm('Anda yakin ingin MENOLAK transaksi ini?')) {
            post(route('approvals.reject', id));
        }
    };

    return (
        <AuthenticatedLayout header="Persetujuan Transaksi">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Otorisasi Transaksi PENDING</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Daftar transaksi yang membutuhkan persetujuan manajer / head teller sebelum dibukukan.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Waktu</th>
                                    <th className="px-6 py-4">Nasabah & Rekening</th>
                                    <th className="px-6 py-4">Tipe & Jumlah</th>
                                    <th className="px-6 py-4">Keterangan</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {pendingTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Icons.CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
                                                <p className="text-base font-medium text-slate-700 dark:text-slate-300">Tidak ada transaksi PENDING</p>
                                                <p className="text-sm mt-1">Semua transaksi sudah diproses.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pendingTransactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-slate-900 dark:text-slate-200">
                                                    {new Date(trx.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                                <br />
                                                <span className="text-xs text-slate-500">
                                                    {new Date(trx.created_at).toLocaleTimeString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900 dark:text-slate-200">
                                                    {trx.savings_account.customer?.name}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {trx.savings_account.account_number} ({trx.savings_account.product?.name})
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                                                    trx.transaction_type === 'DEPOSIT' 
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {trx.transaction_type === 'DEPOSIT' ? 'SETORAN' : 'TARIKAN'}
                                                </span>
                                                <div className="font-bold text-slate-900 dark:text-slate-200 mt-1">
                                                    Rp {formatCurrency(trx.amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-600 dark:text-slate-300">{trx.description}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    <Icons.Clock className="w-3.5 h-3.5" />
                                                    PENDING
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApprove(trx.id)}
                                                        disabled={processing}
                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-900/20 dark:hover:bg-emerald-600 transition-colors focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                                        title="Approve"
                                                    >
                                                        <Icons.Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(trx.id)}
                                                        disabled={processing}
                                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-600 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
                                                        title="Reject"
                                                    >
                                                        <Icons.X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
