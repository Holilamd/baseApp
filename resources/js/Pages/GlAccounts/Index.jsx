import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { BookOpen, Plus, Edit2, Trash2, X, Search, ChevronRight } from 'lucide-react';

export default function Index({ accounts }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        parent_id: '',
        account_number: '',
        name: '',
        normal_balance: 'DEBIT'
    });

    const openCreateModal = () => {
        setEditingAccount(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (account) => {
        setEditingAccount(account);
        setData({
            parent_id: account.parent_id || '',
            account_number: account.account_number,
            name: account.name,
            normal_balance: account.normal_balance
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAccount) {
            put(route('gl-accounts.update', editingAccount.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('gl-accounts.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (account) => {
        if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
            destroy(route('gl-accounts.destroy', account.id));
        }
    };

    const filteredAccounts = accounts.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.account_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout header="GL Accounts">
            <Head title="GL Accounts" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-brand" />
                        Bagan Akun (GL)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Kelola chart of accounts untuk keperluan jurnal BMT.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari akun..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all dark:text-slate-200"
                        />
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-brand/30 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Tambah Akun</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nomor Akun</th>
                                <th className="px-6 py-4 font-semibold">Nama Akun</th>
                                <th className="px-6 py-4 font-semibold">Parent Account (Induk)</th>
                                <th className="px-6 py-4 font-semibold">Saldo Normal</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredAccounts.length > 0 ? (
                                filteredAccounts.map(account => (
                                    <tr key={account.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {account.account_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                            {account.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {account.parent ? (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <ChevronRight className="w-3 h-3" />
                                                    <span className="font-mono">{account.parent.account_number}</span> - {account.parent.name}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Akun Utama (Root)</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                account.normal_balance === 'DEBIT' 
                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            }`}>
                                                {account.normal_balance}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEditModal(account)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(account)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                                            <p>Belum ada bagan akun yang ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Formulir */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                {editingAccount ? 'Edit Bagan Akun' : 'Tambah Bagan Akun'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nomor Akun</label>
                                <input 
                                    type="text"
                                    value={data.account_number}
                                    onChange={e => setData('account_number', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                    placeholder="Contoh: 110-01"
                                />
                                {errors.account_number && <p className="text-red-500 text-xs mt-1.5">{errors.account_number}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Akun</label>
                                <input 
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                    placeholder="Contoh: Kas Teller"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Parent Account (Induk - Opsional)</label>
                                <select
                                    value={data.parent_id}
                                    onChange={e => setData('parent_id', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                >
                                    <option value="">-- Tidak Ada Induk (Utama) --</option>
                                    {accounts.filter(a => !editingAccount || a.id !== editingAccount.id).map(a => (
                                        <option key={a.id} value={a.id}>{a.account_number} - {a.name}</option>
                                    ))}
                                </select>
                                {errors.parent_id && <p className="text-red-500 text-xs mt-1.5">{errors.parent_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Saldo Normal</label>
                                <select
                                    value={data.normal_balance}
                                    onChange={e => setData('normal_balance', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                >
                                    <option value="DEBIT">DEBIT (Aset, Beban)</option>
                                    <option value="CREDIT">KREDIT (Kewajiban, Ekuitas, Pendapatan)</option>
                                </select>
                                {errors.normal_balance && <p className="text-red-500 text-xs mt-1.5">{errors.normal_balance}</p>}
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
                                    className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-600 rounded-xl shadow-lg shadow-brand/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {processing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
