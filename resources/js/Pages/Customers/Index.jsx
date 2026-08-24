import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Users2, Plus, Edit2, Trash2, X, Search, ShieldAlert, BadgeCheck } from 'lucide-react';

export default function Index({ customers, branches }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        branch_id: branches.length > 0 ? branches[0].id : '',
        cif_number: '',
        full_name: '',
        identity_type: 'KTP',
        identity_number: '',
        address: '',
        phone_number: '',
        mother_maiden_name: '',
        status: 'ACTIVE',
        principal_saving: '',
        mandatory_saving: '',
    });

    const openCreateModal = () => {
        setEditingCustomer(null);
        reset();
        clearErrors();
        
        // Auto-generate a basic CIF number for demo
        const randomCIF = Math.floor(100000000 + Math.random() * 900000000).toString();
        setData('cif_number', randomCIF);
        
        setIsModalOpen(true);
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setData({
            branch_id: customer.branch_id,
            cif_number: customer.cif_number,
            full_name: customer.full_name,
            identity_type: customer.identity_type,
            identity_number: customer.identity_number,
            address: customer.address || '',
            phone_number: customer.phone_number || '',
            mother_maiden_name: customer.mother_maiden_name,
            status: customer.status,
            principal_saving: customer.principal_saving || '',
            mandatory_saving: customer.mandatory_saving || '',
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
        if (editingCustomer) {
            put(route('customers.update', editingCustomer.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('customers.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (customer) => {
        if (confirm(`Apakah Anda yakin ingin menghapus nasabah ${customer.full_name}?`)) {
            destroy(route('customers.destroy', customer.id));
        }
    };

    const filteredCustomers = customers.filter(c => 
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.cif_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout header="Customer Information File (CIF)">
            <Head title="Customers" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users2 className="w-6 h-6 text-brand" />
                        Pendaftaran CIF
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Kelola direktori data anggota / nasabah koperasi.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari nasabah..."
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
                        <span className="hidden sm:inline">Nasabah Baru</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nomor CIF</th>
                                <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                                <th className="px-6 py-4 font-semibold">Identitas</th>
                                <th className="px-6 py-4 font-semibold">Cabang</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 font-mono font-medium text-brand">
                                            {customer.cif_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{customer.full_name}</span>
                                                <span className="text-xs text-slate-500">{customer.phone_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-500">{customer.identity_type}</span>
                                                <span className="text-sm">{customer.identity_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.branch ? customer.branch.name : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.status === 'ACTIVE' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase rounded">
                                                    <BadgeCheck className="w-3 h-3" /> Aktif
                                                </span>
                                            ) : customer.status === 'BLOCKED' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold uppercase rounded">
                                                    <ShieldAlert className="w-3 h-3" /> Diblokir
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold uppercase rounded">
                                                    Tutup
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEditModal(customer)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(customer)}
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
                                            <Users2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                                            <p>Belum ada data nasabah.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Formulir CIF */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                {editingCustomer ? 'Edit Data Nasabah' : 'Pendaftaran CIF Baru'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 overflow-y-auto space-y-5">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nomor CIF</label>
                                        <input 
                                            type="text"
                                            value={data.cif_number}
                                            onChange={e => setData('cif_number', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm font-mono"
                                            placeholder="Auto-generated"
                                        />
                                        {errors.cif_number && <p className="text-red-500 text-xs mt-1.5">{errors.cif_number}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cabang (Branch)</label>
                                        <select
                                            value={data.branch_id}
                                            onChange={e => setData('branch_id', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                        >
                                            <option value="">Pilih Cabang...</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                                            ))}
                                        </select>
                                        {errors.branch_id && <p className="text-red-500 text-xs mt-1.5">{errors.branch_id}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap Sesuai Identitas</label>
                                    <input 
                                        type="text"
                                        value={data.full_name}
                                        onChange={e => setData('full_name', e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                        placeholder="Misal: Ahmad Fulan"
                                    />
                                    {errors.full_name && <p className="text-red-500 text-xs mt-1.5">{errors.full_name}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Jenis Identitas</label>
                                        <select
                                            value={data.identity_type}
                                            onChange={e => setData('identity_type', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                        >
                                            <option value="KTP">KTP</option>
                                            <option value="SIM">SIM</option>
                                            <option value="PASPOR">Paspor</option>
                                        </select>
                                        {errors.identity_type && <p className="text-red-500 text-xs mt-1.5">{errors.identity_type}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nomor Identitas</label>
                                        <input 
                                            type="text"
                                            value={data.identity_number}
                                            onChange={e => setData('identity_number', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                            placeholder="Ketik NIK..."
                                        />
                                        {errors.identity_number && <p className="text-red-500 text-xs mt-1.5">{errors.identity_number}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">No. HP / WhatsApp</label>
                                        <input 
                                            type="text"
                                            value={data.phone_number}
                                            onChange={e => setData('phone_number', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                            placeholder="Contoh: 0812..."
                                        />
                                        {errors.phone_number && <p className="text-red-500 text-xs mt-1.5">{errors.phone_number}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Ibu Kandung</label>
                                        <input 
                                            type="text"
                                            value={data.mother_maiden_name}
                                            onChange={e => setData('mother_maiden_name', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                            placeholder="Untuk keperluan keamanan"
                                        />
                                        {errors.mother_maiden_name && <p className="text-red-500 text-xs mt-1.5">{errors.mother_maiden_name}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Alamat Tempat Tinggal</label>
                                    <textarea 
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows="2"
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm resize-none"
                                        placeholder="Alamat domisili..."
                                    ></textarea>
                                    {errors.address && <p className="text-red-500 text-xs mt-1.5">{errors.address}</p>}
                                </div>
                                
                                {!editingCustomer && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Setoran Simpanan Pokok Awal (Rp)</label>
                                            <input 
                                                type="number"
                                                value={data.principal_saving}
                                                onChange={e => setData('principal_saving', e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                                placeholder="Contoh: 100000"
                                                min="0"
                                            />
                                            {errors.principal_saving && <p className="text-red-500 text-xs mt-1.5">{errors.principal_saving}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Setoran Simpanan Wajib Awal (Rp)</label>
                                            <input 
                                                type="number"
                                                value={data.mandatory_saving}
                                                onChange={e => setData('mandatory_saving', e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                                placeholder="Contoh: 50000"
                                                min="0"
                                            />
                                            {errors.mandatory_saving && <p className="text-red-500 text-xs mt-1.5">{errors.mandatory_saving}</p>}
                                        </div>
                                    </div>
                                )}

                                {editingCustomer && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status Nasabah</label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                        >
                                            <option value="ACTIVE">AKTIF</option>
                                            <option value="BLOCKED">DIBLOKIR</option>
                                            <option value="CLOSED">DITUTUP</option>
                                        </select>
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
                                    {editingCustomer ? 'Simpan Perubahan' : 'Daftarkan Nasabah'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
