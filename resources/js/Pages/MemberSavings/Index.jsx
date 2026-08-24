import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Landmark, Search, CreditCard, PiggyBank, Receipt, Save, ArrowRightLeft } from 'lucide-react';
import AsyncSelect from '@/Components/AsyncSelect';

export default function Index({ customers }) {
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [history, setHistory] = useState([]);
    const { errors: serverErrors } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        type: 'MANDATORY',
        amount: '',
        description: '',
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const fetchHistory = (customerId) => {
        if (!customerId) {
            setHistory([]);
            return;
        }
        fetch(`/api/member-savings/${customerId}/history`)
            .then(res => res.json())
            .then(data => setHistory(data))
            .catch(err => console.error(err));
    };

    const handleCustomerChange = (id) => {
        setSelectedCustomerId(id);
        setData('customer_id', id);
        if (id) {
            const customer = customers.find(c => String(c.id) === String(id));
            setSelectedCustomer(customer || null);
            fetchHistory(id);
        } else {
            setSelectedCustomer(null);
            setHistory([]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('member-savings.deposit'), {
            onSuccess: () => {
                // Refresh local data from page props
                const updated = customers.find(c => String(c.id) === String(data.customer_id));
                if (updated) setSelectedCustomer(updated);
                fetchHistory(data.customer_id);
                reset('amount', 'description');
            }
        });
    };

    return (
        <AuthenticatedLayout header="Simpanan Keanggotaan BMT">
            <Head title="Setoran Simpanan Pokok / Wajib" />

            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Landmark className="w-6 h-6 text-brand" />
                        Simpanan Pokok & Wajib Anggota
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Proses transaksi setoran Simpanan Pokok dan Simpanan Wajib rutin bulanan anggota.
                    </p>
                </div>

                {serverErrors.message && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <span className="text-red-600 mt-0.5">⚠️</span>
                        <div>
                            <h4 className="text-sm font-bold text-red-800">Transaksi Gagal</h4>
                            <p className="text-sm text-red-600 mt-1">{serverErrors.message}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left/Main Column: Member Search & Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Member Search Card */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Search className="w-4 h-4 text-slate-400" /> Cari Nomor CIF / Nama Anggota
                            </label>
                            <AsyncSelect
                                apiEndpoint="/api/search/customers"
                                value={selectedCustomerId}
                                onChange={handleCustomerChange}
                                placeholder="Ketik CIF atau Nama..."
                                valueKey="id"
                                displayKey="full_name"
                                renderOption={(option, isSelectedView) => {
                                    if (isSelectedView) return `${option.cif_number} - ${option.full_name}`;
                                    return (
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{option.full_name}</span>
                                            <span className="text-xs text-slate-500">CIF: {option.cif_number} &bull; NIK: {option.identity_number}</span>
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        {/* Setoran Form Card */}
                        {selectedCustomer && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-brand/5 flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-brand" />
                                    <h3 className="font-bold text-slate-800 dark:text-white">Form Setoran Simpanan</h3>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pilih Jenis Simpanan</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${data.type === 'PRINCIPAL' ? 'border-brand bg-brand/5 dark:bg-brand/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="type" 
                                                    value="PRINCIPAL" 
                                                    checked={data.type === 'PRINCIPAL'}
                                                    onChange={e => setData('type', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <PiggyBank className={`w-6 h-6 mb-2 ${data.type === 'PRINCIPAL' ? 'text-brand' : 'text-slate-400'}`} />
                                                <span className="font-bold text-sm text-slate-800 dark:text-white">Simpanan Pokok</span>
                                                <span className="text-xs text-slate-500 mt-0.5">Sekali bayar / pendaftaran</span>
                                            </label>
                                            
                                            <label className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${data.type === 'MANDATORY' ? 'border-brand bg-brand/5 dark:bg-brand/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="type" 
                                                    value="MANDATORY" 
                                                    checked={data.type === 'MANDATORY'}
                                                    onChange={e => setData('type', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <ArrowRightLeft className={`w-6 h-6 mb-2 ${data.type === 'MANDATORY' ? 'text-brand' : 'text-slate-400'}`} />
                                                <span className="font-bold text-sm text-slate-800 dark:text-white">Simpanan Wajib</span>
                                                <span className="text-xs text-slate-500 mt-0.5">Rutin berkala / bulanan</span>
                                            </label>
                                        </div>
                                        {errors.type && <p className="text-red-500 text-xs mt-1.5">{errors.type}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Jumlah Setoran (Rp)</label>
                                        <input 
                                            type="number"
                                            value={data.amount}
                                            onChange={e => setData('amount', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                            placeholder="Contoh: 50000"
                                            required
                                            min="1000"
                                        />
                                        {errors.amount && <p className="text-red-500 text-xs mt-1.5">{errors.amount}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Keterangan / Notes (Opsional)</label>
                                        <input 
                                            type="text"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                            placeholder="Setoran wajib bulan Agustus..."
                                            maxLength="255"
                                        />
                                        {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description}</p>}
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <button 
                                            type="submit"
                                            disabled={processing}
                                            className="px-6 py-2.5 bg-brand hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-brand/30 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {processing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4.5 h-4.5" />}
                                            Proses Setoran Tunai
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Member Account Summary Info */}
                    <div className="lg:col-span-1">
                        {selectedCustomer ? (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6 sticky top-6 animate-in fade-in duration-300">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Anggota</h4>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{selectedCustomer.full_name}</h3>
                                        <p className="text-mono text-xs text-brand font-bold">{selectedCustomer.cif_number}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
                                        <span className="text-xs text-slate-500 font-medium block">Total Simpanan Pokok</span>
                                        <span className="text-xl font-extrabold text-slate-800 dark:text-white font-mono mt-1 block">
                                            {formatCurrency(selectedCustomer.principal_saving)}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
                                        <span className="text-xs text-slate-500 font-medium block">Total Simpanan Wajib</span>
                                        <span className="text-xl font-extrabold text-slate-800 dark:text-white font-mono mt-1 block">
                                            {formatCurrency(selectedCustomer.mandatory_saving)}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                                    💡 <strong>Info:</strong> Simpanan Pokok dan Wajib diakui sebagai **Modal/Ekuitas Koperasi**. Akun ini tidak dapat ditarik secara bebas oleh anggota melainkan hanya saat anggota bersangkutan mengundurkan diri dari keanggotaan koperasi.
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
                                <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                <p className="text-sm">Pilih nasabah di sebelah kiri untuk melihat ringkasan saldo simpanan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
