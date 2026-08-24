import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Package, Plus, Edit2, Trash2, X, Search, CheckCircle2, XCircle, Settings2, Save, Link2 } from 'lucide-react';

const TRIGGER_OPTIONS_FUNDING = [
    { value: 'CASH_DEPOSIT', label: 'Setoran Tunai', defaultPos: 'CREDIT' },
    { value: 'CASH_WITHDRAWAL', label: 'Penarikan Tunai', defaultPos: 'DEBIT' },
];

const TRIGGER_OPTIONS_LENDING = [
    { value: 'DISBURSEMENT', label: 'Pencairan Dana', defaultPos: 'DEBIT' },
    { value: 'INSTALLMENT_PRINCIPAL', label: 'Angsuran Pokok', defaultPos: 'CREDIT' },
    { value: 'INSTALLMENT_MARGIN', label: 'Angsuran Margin', defaultPos: 'CREDIT' },
];

export default function Index({ products, gl_accounts = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // GL Mapping Modal
    const [isGlModalOpen, setIsGlModalOpen] = useState(false);
    const [glProduct, setGlProduct] = useState(null);
    const [glMappings, setGlMappings] = useState([]);
    const [glSaving, setGlSaving] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        type: 'FUNDING',
        status: 'ACTIVE',
        description: '',
        calculation_method: '',
    });

    const openCreateModal = () => {
        setEditingProduct(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setData({
            code: product.code,
            name: product.name,
            type: product.type,
            status: product.status,
            description: product.description || '',
            calculation_method: product.calculation_method || '',
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
        if (editingProduct) {
            put(route('products.update', editingProduct.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('products.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (product) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            destroy(route('products.destroy', product.id));
        }
    };

    // GL Mapping Modal Functions
    const [glForm, setGlForm] = useState({
        piutang: '',
        deferredMargin: '',
        pendapatanMargin: '',
        simpanan: '',
    });

    const openGlModal = (product) => {
        setGlProduct(product);
        const existingMappings = product.gl_mappings || [];
        
        if (product.type === 'LENDING') {
            const disb = existingMappings.find(m => m.transaction_trigger === 'DISBURSEMENT');
            const defM = existingMappings.find(m => m.transaction_trigger === 'DEFERRED_MARGIN');
            const instM = existingMappings.find(m => m.transaction_trigger === 'INSTALLMENT_MARGIN');
            
            setGlForm({
                piutang: disb ? String(disb.gl_account_id) : '',
                deferredMargin: defM ? String(defM.gl_account_id) : '',
                pendapatanMargin: instM ? String(instM.gl_account_id) : '',
                simpanan: '',
            });
        } else {
            const dep = existingMappings.find(m => m.transaction_trigger === 'CASH_DEPOSIT');
            setGlForm({
                piutang: '',
                deferredMargin: '',
                pendapatanMargin: '',
                simpanan: dep ? String(dep.gl_account_id) : '',
            });
        }
        setIsGlModalOpen(true);
    };

    const closeGlModal = () => {
        setIsGlModalOpen(false);
        setGlProduct(null);
    };

    const saveGlMappings = () => {
        let mappings = [];
        if (glProduct.type === 'LENDING') {
            if (!glForm.piutang || !glForm.deferredMargin || !glForm.pendapatanMargin) {
                alert('Semua akun GL pembiayaan wajib diisi.');
                return;
            }
            mappings = [
                { transaction_trigger: 'DISBURSEMENT', gl_account_id: glForm.piutang, position: 'DEBIT' },
                { transaction_trigger: 'INSTALLMENT_PRINCIPAL', gl_account_id: glForm.piutang, position: 'CREDIT' },
                { transaction_trigger: 'DEFERRED_MARGIN', gl_account_id: glForm.deferredMargin, position: 'CREDIT' },
                { transaction_trigger: 'INSTALLMENT_MARGIN', gl_account_id: glForm.pendapatanMargin, position: 'CREDIT' },
            ];
        } else {
            if (!glForm.simpanan) {
                alert('Akun GL simpanan wajib diisi.');
                return;
            }
            mappings = [
                { transaction_trigger: 'CASH_DEPOSIT', gl_account_id: glForm.simpanan, position: 'CREDIT' },
                { transaction_trigger: 'CASH_WITHDRAWAL', gl_account_id: glForm.simpanan, position: 'DEBIT' },
            ];
        }

        setGlSaving(true);
        router.post(route('products.gl-mappings', glProduct.id), {
            mappings
        }, {
            onSuccess: () => { setIsGlModalOpen(false); setGlSaving(false); },
            onError: () => setGlSaving(false),
        });
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getGlStatusBadge = (product) => {
        const mappings = product.gl_mappings || [];
        if (mappings.length === 0) {
            return <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded">BELUM SET</span>;
        }
        return <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">{mappings.length} MAPPED</span>;
    };

    return (
        <AuthenticatedLayout header="Products">
            <Head title="Products" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Package className="w-6 h-6 text-brand" />
                        Master Produk
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Kelola jenis tabungan, pembiayaan, dan layanan BMT.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari produk..."
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
                        <span className="hidden sm:inline">Tambah Produk</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Kode</th>
                                <th className="px-6 py-4 font-semibold">Nama Produk</th>
                                <th className="px-6 py-4 font-semibold">Kategori</th>
                                <th className="px-6 py-4 font-semibold">Metode</th>
                                <th className="px-6 py-4 font-semibold">Pemetaan GL</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {product.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                product.type === 'FUNDING' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                product.type === 'LENDING' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                                {product.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.calculation_method ? (
                                                <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-[9px] font-bold rounded">{product.calculation_method}</span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getGlStatusBadge(product)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.status === 'ACTIVE' ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                                    <XCircle className="w-3.5 h-3.5" /> Inaktif
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openGlModal(product)}
                                                    className="p-1.5 text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                                                    title="Atur Pemetaan GL / COA"
                                                >
                                                    <Settings2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => openEditModal(product)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product)}
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
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                                            <p>Belum ada produk yang ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Formulir Produk */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Kode Produk</label>
                                <input 
                                    type="text"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                    placeholder="Contoh: TAB-WD"
                                />
                                {errors.code && <p className="text-red-500 text-xs mt-1.5">{errors.code}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Produk</label>
                                <input 
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                    placeholder="Contoh: Tabungan Wadi'ah"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Kategori</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                    >
                                        <option value="FUNDING">Tabungan (Funding)</option>
                                        <option value="LENDING">Pembiayaan (Lending)</option>
                                        <option value="SERVICE">Jasa (Service)</option>
                                    </select>
                                    {errors.type && <p className="text-red-500 text-xs mt-1.5">{errors.type}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                    >
                                        <option value="ACTIVE">Aktif</option>
                                        <option value="INACTIVE">Inaktif</option>
                                    </select>
                                    {errors.status && <p className="text-red-500 text-xs mt-1.5">{errors.status}</p>}
                                </div>
                            </div>

                            {/* Calculation Method - only for LENDING */}
                            {(data.type === 'LENDING') && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Metode Perhitungan Angsuran</label>
                                    <select
                                        value={data.calculation_method}
                                        onChange={e => setData('calculation_method', e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                    >
                                        <option value="">-- Pilih Metode --</option>
                                        <option value="FLAT">Flat Rate (Tetap)</option>
                                        <option value="EFFECTIVE">Efektif (Menurun)</option>
                                        <option value="ANNUITY">Anuitas</option>
                                    </select>
                                    {errors.calculation_method && <p className="text-red-500 text-xs mt-1.5">{errors.calculation_method}</p>}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Keterangan (Opsional)</label>
                                <textarea 
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows="2"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm resize-none"
                                    placeholder="Penjelasan produk..."
                                ></textarea>
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

            {/* Modal Pemetaan GL / COA */}
            {isGlModalOpen && glProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeGlModal}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-brand/10 bg-violet-50 dark:bg-violet-900/20">
                            <div>
                                <h3 className="font-bold text-lg flex items-center gap-2 text-violet-700 dark:text-violet-300">
                                    <Link2 className="w-5 h-5" />
                                    Pemetaan GL / COA
                                </h3>
                                <p className="text-xs text-violet-500 mt-0.5">Produk: <strong>{glProduct.name}</strong> ({glProduct.code})</p>
                            </div>
                            <button onClick={closeGlModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                         <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500">Hubungkan produk ini ke Akun Buku Besar (GL Account) yang sesuai. Pengaturan ini akan digunakan oleh sistem saat membuat jurnal otomatis.</p>
                            
                            <div className="space-y-4">
                                {glProduct.type === 'LENDING' ? (
                                    <>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Akun Piutang Pembiayaan</label>
                                            <p className="text-xs text-slate-500 mb-2">Digunakan untuk menjurnal Pencairan Pokok (Debit) & Angsuran Pokok (Kredit).</p>
                                            <select
                                                value={glForm.piutang}
                                                onChange={e => setGlForm(prev => ({ ...prev, piutang: e.target.value }))}
                                                className="w-full rounded-xl border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-violet-500 focus:border-violet-500"
                                            >
                                                <option value="">-- Pilih Akun GL --</option>
                                                {gl_accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Akun Margin Pembiayaan Ditangguhkan</label>
                                            <p className="text-xs text-slate-500 mb-2">Penampung sisa keuntungan pembiayaan syariah sebelum direalisasi.</p>
                                            <select
                                                value={glForm.deferredMargin}
                                                onChange={e => setGlForm(prev => ({ ...prev, deferredMargin: e.target.value }))}
                                                className="w-full rounded-xl border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-violet-500 focus:border-violet-500"
                                            >
                                                <option value="">-- Pilih Akun GL --</option>
                                                {gl_accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Akun Pendapatan Margin Pembiayaan</label>
                                            <p className="text-xs text-slate-500 mb-2">Diakui secara prorata setiap kali nasabah membayar angsuran bulanan.</p>
                                            <select
                                                value={glForm.pendapatanMargin}
                                                onChange={e => setGlForm(prev => ({ ...prev, pendapatanMargin: e.target.value }))}
                                                className="w-full rounded-xl border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-violet-500 focus:border-violet-500"
                                            >
                                                <option value="">-- Pilih Akun GL --</option>
                                                {gl_accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Akun Kewajiban Simpanan / Tabungan</label>
                                        <p className="text-xs text-slate-500 mb-2">Digunakan untuk Setoran Tabungan (Kredit) & Penarikan Tabungan (Debit).</p>
                                        <select
                                            value={glForm.simpanan}
                                            onChange={e => setGlForm(prev => ({ ...prev, simpanan: e.target.value }))}
                                            className="w-full rounded-xl border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-violet-500 focus:border-violet-500"
                                        >
                                            <option value="">-- Pilih Akun GL --</option>
                                            {gl_accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button type="button" onClick={closeGlModal} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    Batal
                                </button>
                                <button 
                                    onClick={saveGlMappings}
                                    disabled={glSaving}
                                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-600/30 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {glSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan Pemetaan GL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
