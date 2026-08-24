import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Wallet, Plus, Edit2, Trash2, X, Search, ShieldAlert, BadgeCheck, Clock, User, Phone, MapPin, Loader2 } from 'lucide-react';
import AsyncSelect from '@/Components/AsyncSelect';
import axios from 'axios';

export default function Index({ savings, branches, customers, products }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
    const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        branch_id: branches.length > 0 ? branches[0].id : '',
        customer_id: '',
        product_id: '',
        account_number: '',
        status: 'ACTIVE'
    });

    React.useEffect(() => {
        if (!data.customer_id) {
            setSelectedCustomerDetails(null);
            return;
        }

        // If editing, we can still load it but might not strictly need to
        // unless we want to show the profile card in edit mode too.
        setIsLoadingCustomer(true);
        axios.get(`/api/customers/${data.customer_id}/details`)
            .then(res => {
                setSelectedCustomerDetails(res.data);
            })
            .catch(err => {
                console.error("Failed to load customer details", err);
            })
            .finally(() => {
                setIsLoadingCustomer(false);
            });
    }, [data.customer_id]);

    const openCreateModal = () => {
        setEditingAccount(null);
        reset();
        clearErrors();
        
        // Auto-generate a basic Account Number for demo
        const randomAcc = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        setData('account_number', randomAcc);
        
        setIsModalOpen(true);
    };

    const openEditModal = (account) => {
        setEditingAccount(account);
        setData({
            branch_id: account.branch_id,
            customer_id: account.customer_id,
            product_id: account.product_id,
            account_number: account.account_number,
            status: account.status
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
            put(route('savings.update', editingAccount.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('savings.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (account) => {
        if (confirm(`Apakah Anda yakin ingin menghapus rekening ${account.account_number}?`)) {
            destroy(route('savings.destroy', account.id));
        }
    };

    const filteredSavings = savings.filter(s => 
        s.account_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.customer && s.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <AuthenticatedLayout header="Savings Accounts">
            <Head title="Savings" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-brand" />
                        Rekening Tabungan
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Kelola pembukaan dan data rekening simpanan nasabah.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari rekening/nasabah..."
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
                        <span className="hidden sm:inline">Buka Rekening</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">No. Rekening</th>
                                <th className="px-6 py-4 font-semibold">Nasabah</th>
                                <th className="px-6 py-4 font-semibold">Produk</th>
                                <th className="px-6 py-4 font-semibold text-right">Saldo Saat Ini</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredSavings.length > 0 ? (
                                filteredSavings.map(account => (
                                    <tr key={account.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 font-mono font-medium text-brand">
                                            {account.account_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{account.customer ? account.customer.full_name : '-'}</span>
                                                <span className="text-xs text-slate-500">CIF: {account.customer ? account.customer.cif_number : '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {account.product ? account.product.name : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                                            {formatCurrency(account.balance)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {account.status === 'ACTIVE' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase rounded">
                                                    <BadgeCheck className="w-3 h-3" /> Aktif
                                                </span>
                                            ) : account.status === 'DORMANT' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase rounded">
                                                    <Clock className="w-3 h-3" /> Pasif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold uppercase rounded">
                                                    <ShieldAlert className="w-3 h-3" /> {account.status === 'BLOCKED' ? 'Blokir' : 'Tutup'}
                                                </span>
                                            )}
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
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Wallet className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                                            <p>Belum ada data rekening tabungan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Formulir Rekening */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                {editingAccount ? 'Edit Rekening' : 'Pembukaan Rekening Tabungan'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-4">
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Pilih Nasabah (Cari Nama / CIF)</label>
                                    {editingAccount ? (
                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                                            {editingAccount.customer?.cif_number} - {editingAccount.customer?.full_name}
                                        </div>
                                    ) : (
                                        <AsyncSelect
                                            apiEndpoint="/api/search/customers"
                                            value={data.customer_id}
                                            onChange={(val) => setData('customer_id', val)}
                                            placeholder="Ketik Budi atau C-100..."
                                            valueKey="id"
                                            displayKey="full_name"
                                            error={errors.customer_id}
                                            renderOption={(option, isSelectedView) => {
                                                if (isSelectedView) return `${option.cif_number} - ${option.full_name}`;
                                                return (
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{option.full_name}</span>
                                                        <span className="text-xs text-slate-500 font-mono">CIF: {option.cif_number}</span>
                                                    </div>
                                                );
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Customer Profile Card (KYC Preview) */}
                                {isLoadingCustomer ? (
                                    <div className="flex items-center justify-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                        <Loader2 className="w-5 h-5 text-brand animate-spin" />
                                        <span className="ml-2 text-sm text-slate-500">Memuat profil nasabah...</span>
                                    </div>
                                ) : selectedCustomerDetails ? (
                                    <div className="border border-brand/20 bg-brand-glow dark:bg-brand-900/10 rounded-xl p-4 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-full -z-10"></div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-brand font-bold text-xl shadow-sm shrink-0">
                                                {selectedCustomerDetails.full_name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                                    {selectedCustomerDetails.full_name}
                                                    <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                                </h4>
                                                <p className="text-xs text-slate-500 font-mono mb-2">CIF: {selectedCustomerDetails.cif_number}</p>
                                                
                                                <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2">
                                                    <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> KTP: {selectedCustomerDetails.identity_number}</div>
                                                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selectedCustomerDetails.phone_number || '-'}</div>
                                                    <div className="flex items-center gap-1.5 col-span-2"><MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{selectedCustomerDetails.address || '-'}</span></div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-brand/10 dark:border-slate-800 flex items-center gap-4 text-xs font-medium">
                                                    <div>
                                                        <span className="text-slate-500">Rek. Tabungan Aktif: </span>
                                                        <span className="text-brand font-bold">{selectedCustomerDetails.savings_accounts?.filter(s => s.status === 'ACTIVE').length || 0}</span>
                                                    </div>
                                                    {/* Bisa ditambah relasi financing nanti */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : !editingAccount && (
                                    <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-center text-sm text-slate-500">
                                        Pilih Nasabah di atas untuk memverifikasi profil (KYC) dan melihat portofolio rekening.
                                    </div>
                                )}

                                {/* Hanya tampilkan form lanjutan jika nasabah sudah diverifikasi/dipilih */}
                                {(selectedCustomerDetails || editingAccount) && (
                                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Pilih Produk Tabungan</label>
                                            <select
                                                value={data.product_id}
                                                onChange={e => setData('product_id', e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                                disabled={!!editingAccount} // Disable change product on edit
                                            >
                                                <option value="">-- Pilih Produk --</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                                ))}
                                            </select>
                                            {errors.product_id && <p className="text-red-500 text-xs mt-1.5">{errors.product_id}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nomor Rekening</label>
                                                <input 
                                                    type="text"
                                                    value={editingAccount ? data.account_number : 'Auto-Generated'}
                                                    disabled
                                                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-mono cursor-not-allowed"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cabang Pembuat</label>
                                                <select
                                                    value={data.branch_id}
                                                    onChange={e => setData('branch_id', e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                                    disabled={!!editingAccount}
                                                >
                                                    <option value="">Pilih Cabang...</option>
                                                    {branches.map(b => (
                                                        <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                                                    ))}
                                                </select>
                                                {errors.branch_id && <p className="text-red-500 text-xs mt-1.5">{errors.branch_id}</p>}
                                            </div>
                                        </div>

                                        {editingAccount && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status Rekening</label>
                                                <select
                                                    value={data.status}
                                                    onChange={e => setData('status', e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                                >
                                                    <option value="ACTIVE">AKTIF</option>
                                                    <option value="DORMANT">PASIF (DORMANT)</option>
                                                    <option value="BLOCKED">DIBLOKIR</option>
                                                    <option value="CLOSED">DITUTUP</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-600 rounded-xl shadow-lg shadow-brand/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {processing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {editingAccount ? 'Simpan Perubahan' : 'Buka Rekening'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
