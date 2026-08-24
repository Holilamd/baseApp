import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowRightLeft, ArrowUpCircle, ArrowDownCircle, Search, FileText, CheckCircle2, X } from 'lucide-react';
import AsyncSelect from '@/Components/AsyncSelect';

export default function Index({ transactions, savingsAccounts, transactionType }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTxType, setModalTxType] = useState('DEPOSIT');
    const [searchQuery, setSearchQuery] = useState('');
    const { errors: serverErrors } = usePage().props;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        savings_account_id: '',
        transaction_type: 'DEPOSIT',
        amount: '',
        description: ''
    });

    const openModal = (type) => {
        setModalTxType(type);
        reset();
        clearErrors();
        setData('transaction_type', type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('saving-transactions.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const filteredTransactions = transactions.filter(t => 
        (t.savings_account && t.savings_account.account_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.savings_account && t.savings_account.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.journal_header && t.journal_header.journal_number.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <AuthenticatedLayout header="Savings Transactions">
            <Head title="Transaksi Tabungan" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ArrowRightLeft className="w-6 h-6 text-brand" />
                        {transactionType === 'DEPOSIT' ? 'Setoran Simpanan' : transactionType === 'WITHDRAWAL' ? 'Penarikan Simpanan' : 'Transaksi Tabungan'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Input {transactionType === 'DEPOSIT' ? 'Setoran' : transactionType === 'WITHDRAWAL' ? 'Penarikan' : 'Setoran dan Penarikan'} Tunai. Otomatis masuk antrean otorisasi.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari referensi/rekening..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all dark:text-slate-200"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(!transactionType || transactionType === 'DEPOSIT') && (
                            <button 
                                onClick={() => openModal('DEPOSIT')}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/30 shrink-0"
                            >
                                <ArrowDownCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Setor Tunai</span>
                            </button>
                        )}
                        {(!transactionType || transactionType === 'WITHDRAWAL') && (
                            <button 
                                onClick={() => openModal('WITHDRAWAL')}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-amber-500/30 shrink-0"
                            >
                                <ArrowUpCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Tarik Tunai</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Menampilkan pesan error global dari Controller jika ada masalah (misal: saldo tidak cukup atau COA belum di-set) */}
            {serverErrors.message && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <div className="text-red-600 mt-0.5">⚠️</div>
                    <div>
                        <h4 className="text-sm font-bold text-red-800">Transaksi Gagal Diproses</h4>
                        <p className="text-sm text-red-600 mt-1">{serverErrors.message}</p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Waktu & Jurnal</th>
                                <th className="px-6 py-4 font-semibold">Rekening & Nasabah</th>
                                <th className="px-6 py-4 font-semibold">Jenis Transaksi</th>
                                <th className="px-6 py-4 font-semibold text-right">Nominal (Rp)</th>
                                <th className="px-6 py-4 font-semibold">Keterangan</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map(trx => (
                                    <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(trx.created_at)}</span>
                                                {trx.journal_header && (
                                                    <span className="text-xs text-brand font-mono mt-0.5 flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> {trx.journal_header.journal_number}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{trx.savings_account.customer.full_name}</span>
                                                <span className="text-xs text-slate-500 font-mono">{trx.savings_account.account_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {trx.transaction_type === 'DEPOSIT' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase rounded">
                                                    <ArrowDownCircle className="w-3 h-3" /> Setoran Masuk
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase rounded">
                                                    <ArrowUpCircle className="w-3 h-3" /> Penarikan Keluar
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-semibold ${trx.transaction_type === 'DEPOSIT' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {trx.transaction_type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(trx.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs">{trx.description || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {trx.status === 'PENDING' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                                    PENDING
                                                </span>
                                            )}
                                            {trx.status === 'APPROVED' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                                                    APPROVED
                                                </span>
                                            )}
                                            {trx.status === 'REJECTED' && (
                                                <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                                                    REJECTED
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <ArrowRightLeft className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                                            <p>Belum ada riwayat transaksi tabungan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Input Transaksi */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${modalTxType === 'DEPOSIT' ? 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20' : 'border-amber-100 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20'}`}>
                            <h3 className={`font-bold text-lg flex items-center gap-2 ${modalTxType === 'DEPOSIT' ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'}`}>
                                {modalTxType === 'DEPOSIT' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                                {modalTxType === 'DEPOSIT' ? 'Input Setoran Tunai' : 'Input Tarik Tunai'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            
                            {/* Peringatan bahwa jurnal akan ter-generate otomatis */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-xs flex gap-2 items-start">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>Setiap transaksi yang berhasil akan otomatis membuat <strong>Jurnal Akuntansi Double-Entry</strong> di Buku Besar secara real-time.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cari Rekening Nasabah (No. Rekening / Nama CIF)</label>
                                <AsyncSelect
                                    apiEndpoint="/api/search/savings-accounts"
                                    value={data.savings_account_id}
                                    onChange={(val) => setData('savings_account_id', val)}
                                    placeholder="Ketik Budi atau 1001..."
                                    valueKey="id"
                                    displayKey="customer_name"
                                    error={errors.savings_account_id}
                                    renderOption={(option, isSelectedView) => {
                                        if (isSelectedView) return `${option.account_number} - ${option.customer_name}`;
                                        return (
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{option.customer_name}</span>
                                                <span className="text-xs text-slate-500 font-mono flex gap-2">
                                                    <span>{option.account_number}</span> &bull; 
                                                    <span>CIF: {option.cif_number}</span> &bull;
                                                    <span className="text-emerald-600 font-semibold">Rp {new Intl.NumberFormat('id-ID').format(option.balance)}</span>
                                                </span>
                                            </div>
                                        );
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nominal Transaksi (Rp)</label>
                                <input 
                                    type="number"
                                    min="1"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    className="w-full px-4 py-3 text-lg font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white"
                                    placeholder="0"
                                />
                                {errors.amount && <p className="text-red-500 text-xs mt-1.5">{errors.amount}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Keterangan / Berita (Opsional)</label>
                                <input 
                                    type="text"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                    placeholder={transactionType === 'DEPOSIT' ? 'Setoran awal tabungan...' : 'Tarik tunai untuk keperluan...'}
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description}</p>}
                            </div>

                            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`px-6 py-2 text-sm font-medium text-white rounded-xl shadow-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                                        transactionType === 'DEPOSIT' 
                                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' 
                                            : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                                    }`}
                                >
                                    {processing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Proses {transactionType === 'DEPOSIT' ? 'Setoran' : 'Tarikan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
