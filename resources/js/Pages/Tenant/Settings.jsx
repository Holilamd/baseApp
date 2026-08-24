import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Building2, Save, MapPin, User, Image as ImageIcon, ShieldCheck, FileCheck, CheckSquare, UserCheck } from 'lucide-react';

export default function Settings({ tenant, gl_accounts = [] }) {
    const [activeTab, setActiveTab] = useState('identity');

    const { data, setData, post, processing, errors } = useForm({
        name: tenant.name || '',
        settings: {
            company_address: tenant.settings?.company_address || '',
            manager_name: tenant.settings?.manager_name || '',
            logo_url: tenant.settings?.logo_url || '',
            approval_cif_create: tenant.settings?.approval_cif_create || false,
            approval_cif_update: tenant.settings?.approval_cif_update || false,
            approval_open_account: tenant.settings?.approval_open_account || false,
            approval_deposit: tenant.settings?.approval_deposit || false,
            limit_deposit: tenant.settings?.limit_deposit || 0,
            approval_withdrawal: tenant.settings?.approval_withdrawal || false,
            limit_withdrawal: tenant.settings?.limit_withdrawal || 0,
            cash_gl_account_id: tenant.settings?.cash_gl_account_id || '',
            rak_gl_account_id: tenant.settings?.rak_gl_account_id || '',
            principal_saving_gl_account_id: tenant.settings?.principal_saving_gl_account_id || '',
            mandatory_saving_gl_account_id: tenant.settings?.mandatory_saving_gl_account_id || '',
            kop_surat_url: tenant.settings?.kop_surat_url || '',
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tenant.settings.update'));
    };

    return (
        <AuthenticatedLayout header="Pengaturan Koperasi">
            <Head title="Pengaturan Koperasi" />

            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
                
                {/* Sidebar Tabs */}
                <div className="md:w-64 shrink-0">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 space-y-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('identity')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'identity' ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
                        >
                            <Building2 className="w-5 h-5" />
                            Identitas Koperasi
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('approvals')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'approvals' ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
                        >
                            <ShieldCheck className="w-5 h-5" />
                            Otorisasi & Keamanan
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('accounting')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'accounting' ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
                        >
                            <FileCheck className="w-5 h-5" />
                            Akuntansi & Cetak
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6">
                            
                            {/* TAB: IDENTITY */}
                            <div className={activeTab === 'identity' ? 'block space-y-6' : 'hidden'}>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Identitas Koperasi</h3>
                                    <p className="text-slate-500 text-sm mt-1">Kelola informasi dasar dan identitas koperasi yang akan dicetak pada laporan dan struk.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-slate-400" /> Nama Koperasi
                                        </label>
                                        <input 
                                            type="text" 
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" /> Alamat Lengkap Pusat
                                        </label>
                                        <textarea 
                                            value={data.settings.company_address}
                                            onChange={e => setData('settings', { ...data.settings, company_address: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" /> Nama Pimpinan / Manajer
                                        </label>
                                        <input 
                                            type="text" 
                                            value={data.settings.manager_name}
                                            onChange={e => setData('settings', { ...data.settings, manager_name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-slate-400" /> URL Logo Koperasi
                                        </label>
                                        <input 
                                            type="text" 
                                            value={data.settings.logo_url}
                                            onChange={e => setData('settings', { ...data.settings, logo_url: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* TAB: APPROVALS */}
                            <div className={activeTab === 'approvals' ? 'block space-y-6' : 'hidden'}>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">Kebijakan Otorisasi (Approval)</h3>
                                    <p className="text-slate-500 text-sm mt-1">Tentukan modul mana saja yang mewajibkan otorisasi Manajer sebelum data disimpan atau transaksi dibukukan.</p>
                                </div>

                                {/* General Approvals */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Pengkinian & Data Induk</h4>
                                    
                                    <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <UserCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800 dark:text-white">Approval Buka CIF (Pendaftaran Nasabah)</div>
                                                <div className="text-xs text-slate-500">Persetujuan pendaftaran profil nasabah baru</div>
                                            </div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={data.settings.approval_cif_create}
                                            onChange={e => setData('settings', { ...data.settings, approval_cif_create: e.target.checked })}
                                            className="w-5 h-5 text-brand rounded border-slate-300 focus:ring-brand"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <FileCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800 dark:text-white">Approval Update CIF</div>
                                                <div className="text-xs text-slate-500">Perubahan data diri nasabah (Maker-Checker)</div>
                                            </div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={data.settings.approval_cif_update}
                                            onChange={e => setData('settings', { ...data.settings, approval_cif_update: e.target.checked })}
                                            className="w-5 h-5 text-brand rounded border-slate-300 focus:ring-brand"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                <CheckSquare className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800 dark:text-white">Approval Buka Rekening</div>
                                                <div className="text-xs text-slate-500">Persetujuan untuk aktivasi rekening baru</div>
                                            </div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={data.settings.approval_open_account}
                                            onChange={e => setData('settings', { ...data.settings, approval_open_account: e.target.checked })}
                                            className="w-5 h-5 text-brand rounded border-slate-300 focus:ring-brand"
                                        />
                                    </label>
                                </div>

                                {/* Transaction Limits */}
                                <div className="space-y-4 pt-4">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Transaksi Simpanan</h4>
                                    
                                    {/* Setor Tunai */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <div className="font-semibold text-slate-800 dark:text-white">Approval Setor Tunai</div>
                                                <div className="text-xs text-slate-500">Wajibkan otorisasi jika setoran di atas limit tertentu</div>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={data.settings.approval_deposit}
                                                onChange={e => setData('settings', { ...data.settings, approval_deposit: e.target.checked })}
                                                className="w-5 h-5 text-brand rounded border-slate-300 focus:ring-brand"
                                            />
                                        </label>
                                        
                                        {data.settings.approval_deposit && (
                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="deposit_limit_type"
                                                        checked={data.settings.limit_deposit === 0 || data.settings.limit_deposit === '0'}
                                                        onChange={() => setData('settings', { ...data.settings, limit_deposit: 0 })}
                                                        className="text-brand focus:ring-brand"
                                                    />
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">Berlaku untuk semua nominal transaksi</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="deposit_limit_type"
                                                        checked={data.settings.limit_deposit > 0}
                                                        onChange={() => setData('settings', { ...data.settings, limit_deposit: data.settings.limit_deposit > 0 ? data.settings.limit_deposit : 10000000 })}
                                                        className="text-brand focus:ring-brand"
                                                    />
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">Hanya jika nominal di atas limit tertentu</span>
                                                </label>

                                                {data.settings.limit_deposit > 0 && (
                                                    <div className="pl-6 pt-2">
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Limit Nominal Setoran (Rp)</label>
                                                        <input 
                                                            type="number" 
                                                            value={data.settings.limit_deposit}
                                                            onChange={e => setData('settings', { ...data.settings, limit_deposit: Number(e.target.value) })}
                                                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm"
                                                            placeholder="Contoh: 10000000"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tarik Tunai */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <div className="font-semibold text-slate-800 dark:text-white">Approval Tarik Tunai</div>
                                                <div className="text-xs text-slate-500">Wajibkan otorisasi jika penarikan di atas limit tertentu</div>
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={data.settings.approval_withdrawal}
                                                onChange={e => setData('settings', { ...data.settings, approval_withdrawal: e.target.checked })}
                                                className="w-5 h-5 text-brand rounded border-slate-300 focus:ring-brand"
                                            />
                                        </label>
                                        
                                        {data.settings.approval_withdrawal && (
                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="withdrawal_limit_type"
                                                        checked={data.settings.limit_withdrawal === 0 || data.settings.limit_withdrawal === '0'}
                                                        onChange={() => setData('settings', { ...data.settings, limit_withdrawal: 0 })}
                                                        className="text-brand focus:ring-brand"
                                                    />
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">Berlaku untuk semua nominal transaksi</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="withdrawal_limit_type"
                                                        checked={data.settings.limit_withdrawal > 0}
                                                        onChange={() => setData('settings', { ...data.settings, limit_withdrawal: data.settings.limit_withdrawal > 0 ? data.settings.limit_withdrawal : 5000000 })}
                                                        className="text-brand focus:ring-brand"
                                                    />
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">Hanya jika nominal di atas limit tertentu</span>
                                                </label>

                                                {data.settings.limit_withdrawal > 0 && (
                                                    <div className="pl-6 pt-2">
                                                        <label className="block text-xs font-medium text-slate-500 mb-1">Limit Nominal Penarikan (Rp)</label>
                                                        <input 
                                                            type="number" 
                                                            value={data.settings.limit_withdrawal}
                                                            onChange={e => setData('settings', { ...data.settings, limit_withdrawal: Number(e.target.value) })}
                                                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm"
                                                            placeholder="Contoh: 5000000"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* TAB: ACCOUNTING */}
                            <div className={activeTab === 'accounting' ? 'block space-y-6' : 'hidden'}>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">Akuntansi & Cetak</h3>
                                    <p className="text-slate-500 text-sm mt-1">Pengaturan Akun Buku Besar Utama dan preferensi cetak dokumen BMT.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Akun Kas Utama (Kas Teller)</label>
                                        <select 
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                            value={data.settings.cash_gl_account_id}
                                            onChange={e => setData('settings', { ...data.settings, cash_gl_account_id: e.target.value })}
                                        >
                                            <option value="">-- Pilih Akun GL Kas --</option>
                                            {gl_accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Akun RAK (Rekening Antar Kantor)</label>
                                        <select 
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                            value={data.settings.rak_gl_account_id}
                                            onChange={e => setData('settings', { ...data.settings, rak_gl_account_id: e.target.value })}
                                        >
                                            <option value="">-- Pilih Akun RAK --</option>
                                            {gl_accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-500 mt-1">Digunakan sebagai jembatan untuk mutasi lintas cabang.</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Akun Modal Simpanan Pokok</label>
                                        <select 
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                            value={data.settings.principal_saving_gl_account_id}
                                            onChange={e => setData('settings', { ...data.settings, principal_saving_gl_account_id: e.target.value })}
                                        >
                                            <option value="">-- Pilih Akun Simpanan Pokok --</option>
                                            {gl_accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Akun Modal Simpanan Wajib</label>
                                        <select 
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                            value={data.settings.mandatory_saving_gl_account_id}
                                            onChange={e => setData('settings', { ...data.settings, mandatory_saving_gl_account_id: e.target.value })}
                                        >
                                            <option value="">-- Pilih Akun Simpanan Wajib --</option>
                                            {gl_accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-slate-400" /> URL Logo / Kop Surat Koperasi
                                        </label>
                                        <input 
                                            type="text" 
                                            value={data.settings.kop_surat_url}
                                            onChange={e => setData('settings', { ...data.settings, kop_surat_url: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors dark:text-white text-sm"
                                            placeholder="https://example.com/logo.png"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Logo ini akan dipasang sebagai header (Kop) saat mencetak Akad Pembiayaan atau Struk Transaksi.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-600 rounded-xl shadow-lg shadow-brand/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {processing ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Simpan Pengaturan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
