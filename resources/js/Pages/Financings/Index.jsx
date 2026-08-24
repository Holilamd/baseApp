import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Briefcase, FilePlus, Search, CheckCircle2, X, Printer } from 'lucide-react';
import AsyncSelect from '@/Components/AsyncSelect';

export default function Index({ financings, products }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [savingsAccounts, setSavingsAccounts] = useState([]);
    const { errors: serverErrors } = usePage().props;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        customer_id: '',
        product_id: '',
        savings_account_id: '',
        amount: '',
        duration_months: '',
        margin_rate: '',
        notes: ''
    });

    const openModal = () => {
        reset();
        setSavingsAccounts([]);
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('financings.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const filteredFinancings = financings.filter(f => 
        (f.financing_number && f.financing_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.customer && f.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
    };

    // Kalkulasi Real-time
    const amount = parseFloat(data.amount) || 0;
    const rate = parseFloat(data.margin_rate) || 0;
    const months = parseInt(data.duration_months) || 0;
    const totalMargin = amount * (rate / 100) * (months / 12);
    const totalPayment = amount + totalMargin;
    const monthlyInstallment = months > 0 ? totalPayment / months : 0;

    return (
        <AuthenticatedLayout header="Financings">
            <Head title="Pengajuan Pembiayaan" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-brand" />
                        Pengajuan Pembiayaan
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Input form pengajuan pembiayaan (Lending) baru untuk anggota.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari No. Referensi atau Nama..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all dark:text-slate-200"
                        />
                    </div>
                    <button 
                        onClick={openModal}
                        className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-brand/30 shrink-0"
                    >
                        <FilePlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Pengajuan Baru</span>
                    </button>
                </div>
            </div>

            {serverErrors.message && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <div className="text-red-600 mt-0.5">⚠️</div>
                    <div>
                        <h4 className="text-sm font-bold text-red-800">Gagal Memproses</h4>
                        <p className="text-sm text-red-600 mt-1">{serverErrors.message}</p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tgl. Pengajuan</th>
                                <th className="px-6 py-4 font-semibold">No. Ref & Anggota</th>
                                <th className="px-6 py-4 font-semibold">Produk & Tenor</th>
                                <th className="px-6 py-4 font-semibold text-right">Plafon Pokok (Rp)</th>
                                <th className="px-6 py-4 font-semibold text-right">Total Tagihan (Rp)</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredFinancings.length > 0 ? (
                                filteredFinancings.map(f => (
                                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                            {formatDate(f.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-brand dark:text-brand-400">{f.financing_number}</span>
                                                <span className="text-xs text-slate-500 font-medium">{f.customer?.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{f.product?.name}</span>
                                                <span className="text-xs text-slate-500">{f.duration_months} Bulan ({f.margin_rate}% p.a)</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                            {formatCurrency(f.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(f.total_payment)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {f.status === 'PENDING' && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">PENDING</span>}
                                            {f.status === 'APPROVED' && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">APPROVED</span>}
                                            {f.status === 'ACTIVE' && <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">ACTIVE</span>}
                                            {f.status === 'REJECTED' && <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold rounded">REJECTED</span>}
                                            {f.status === 'PAID_OFF' && <span className="px-2 py-1 bg-slate-100 text-slate-800 text-[10px] font-bold rounded">LUNAS</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(f.status === 'ACTIVE' || f.status === 'PAID_OFF') && (
                                                <a href={route('financings.print', f.id)} target="_blank" className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-bold rounded-lg transition-colors">
                                                    <Printer className="w-3.5 h-3.5" /> Cetak Akad
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                                            <p>Belum ada riwayat pengajuan pembiayaan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Input Pengajuan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-brand/10 bg-brand/5">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-brand">
                                <FilePlus className="w-5 h-5" />
                                Form Pengajuan Pembiayaan (Flat Rate)
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Pilih Anggota / Customer</label>
                                    <AsyncSelect
                                        apiEndpoint="/api/search/customers"
                                        value={data.customer_id}
                                        onChange={(val) => {
                                            setData(data => ({ ...data, customer_id: val, savings_account_id: '' }));
                                            if (val) {
                                                fetch(`/api/customers/${val}/details`)
                                                    .then(res => res.json())
                                                    .then(resData => {
                                                        setSavingsAccounts(resData.savingsAccounts || []);
                                                    });
                                            } else {
                                                setSavingsAccounts([]);
                                            }
                                        }}
                                        placeholder="Ketik Nama CIF atau NIK..."
                                        valueKey="id"
                                        displayKey="full_name"
                                        error={errors.customer_id}
                                        renderOption={(option, isSelectedView) => {
                                            if (isSelectedView) return `${option.cif_number} - ${option.full_name}`;
                                            return (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{option.full_name}</span>
                                                    <span className="text-xs text-slate-500 font-mono flex gap-2">
                                                        <span>CIF: {option.cif_number}</span> &bull; 
                                                        <span>NIK: {option.identity_number}</span>
                                                    </span>
                                                </div>
                                            );
                                        }}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rekening Simpanan (Pencairan)</label>
                                    <select 
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                        value={data.savings_account_id}
                                        onChange={e => setData('savings_account_id', e.target.value)}
                                        required
                                        disabled={!data.customer_id}
                                    >
                                        <option value="">-- Pilih Rekening Simpanan --</option>
                                        {savingsAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.account_number} - {acc.product?.name} (Saldo: {formatCurrency(acc.balance)})</option>
                                        ))}
                                    </select>
                                    {errors.savings_account_id && <p className="text-red-500 text-xs mt-1">{errors.savings_account_id}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Produk Pembiayaan</label>
                                    <select 
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                        value={data.product_id}
                                        onChange={e => setData('product_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Produk --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                        ))}
                                    </select>
                                    {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Plafon Pinjaman (Pokok)</label>
                                    <input 
                                        type="number" 
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                        placeholder="10000000"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        required
                                        min="100000"
                                    />
                                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tenor (Bulan)</label>
                                    <input 
                                        type="number" 
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                        placeholder="12"
                                        value={data.duration_months}
                                        onChange={e => setData('duration_months', e.target.value)}
                                        required
                                        min="1"
                                        max="120"
                                    />
                                    {errors.duration_months && <p className="text-red-500 text-xs mt-1">{errors.duration_months}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">% Margin/Bagi Hasil (per Tahun)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand pr-10"
                                            placeholder="12.0"
                                            value={data.margin_rate}
                                            onChange={e => setData('margin_rate', e.target.value)}
                                            required
                                            min="0"
                                            max="100"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</div>
                                    </div>
                                    {errors.margin_rate && <p className="text-red-500 text-xs mt-1">{errors.margin_rate}</p>}
                                </div>

                                {/* Simulation Box */}
                                <div className="md:col-span-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl space-y-2 mt-2">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Simulasi Pembiayaan
                                    </h4>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Plafon Pokok:</span>
                                        <span className="font-semibold">{formatCurrency(amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Total Margin (Selama Tenor):</span>
                                        <span className="font-semibold text-amber-600">+{formatCurrency(totalMargin)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                                        <span className="text-slate-700 dark:text-slate-200 font-bold">Total Tagihan (Pokok + Margin):</span>
                                        <span className="font-bold text-emerald-600">{formatCurrency(totalPayment)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm bg-brand/10 p-2 rounded-lg mt-2">
                                        <span className="text-brand font-semibold">Estimasi Angsuran Per Bulan:</span>
                                        <span className="font-bold text-brand">{formatCurrency(monthlyInstallment)}</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Catatan (Opsional)</label>
                                    <textarea 
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                        placeholder="Catatan agunan atau keperluan pembiayaan..."
                                        rows="2"
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={processing} className="px-5 py-2.5 bg-brand hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-brand/30 disabled:opacity-50 flex items-center gap-2">
                                    {processing ? 'Menyimpan...' : 'Ajukan Pembiayaan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
