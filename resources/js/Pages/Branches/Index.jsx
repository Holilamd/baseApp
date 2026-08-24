import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Building2, Plus, Edit2, Trash2, X, Search, MapPin } from 'lucide-react';

export default function Index({ branches }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        address: ''
    });

    const openCreateModal = () => {
        setEditingBranch(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (branch) => {
        setEditingBranch(branch);
        setData({
            code: branch.code,
            name: branch.name,
            address: branch.address || ''
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
        if (editingBranch) {
            put(route('branches.update', editingBranch.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('branches.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (branch) => {
        if (confirm('Apakah Anda yakin ingin menghapus cabang ini?')) {
            destroy(route('branches.destroy', branch.id));
        }
    };

    const filteredBranches = branches.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout header="Branch Management">
            <Head title="Branch Management" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-brand" />
                        Manajemen Cabang
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Kelola data seluruh kantor cabang BMT Anda.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari cabang..."
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
                        <span className="hidden sm:inline">Tambah Cabang</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Kode</th>
                                <th className="px-6 py-4 font-semibold">Nama Cabang</th>
                                <th className="px-6 py-4 font-semibold">Alamat</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredBranches.length > 0 ? (
                                filteredBranches.map(branch => (
                                    <tr key={branch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {branch.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                            {branch.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2 max-w-xs">
                                                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                                                <span className="truncate" title={branch.address}>{branch.address || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEditModal(branch)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(branch)}
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
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                                            <p>Belum ada data cabang yang ditemukan.</p>
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
                                {editingBranch ? 'Edit Cabang' : 'Tambah Cabang Baru'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Kode Cabang</label>
                                <input 
                                    type="text"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                    placeholder="Contoh: KCP-01"
                                />
                                {errors.code && <p className="text-red-500 text-xs mt-1.5">{errors.code}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Cabang</label>
                                <input 
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                    placeholder="Masukan nama cabang"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Alamat Lengkap</label>
                                <textarea 
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm resize-none"
                                    placeholder="Alamat kantor operasional..."
                                ></textarea>
                                {errors.address && <p className="text-red-500 text-xs mt-1.5">{errors.address}</p>}
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
