import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Banknote, Search, CheckCircle2, AlertTriangle, Printer, CreditCard, Zap } from 'lucide-react';

export default function Index({ financings }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFinancing, setSelectedFinancing] = useState(null);
    const [showPayoffModal, setShowPayoffModal] = useState(false);
    const { errors: serverErrors } = usePage().props;

    const { data, setData, post, processing } = useForm({
        financing_id: '',
        schedule_id: '',
    });

    const { data: payoffData, setData: setPayoffData, post: postPayoff, processing: payoffProcessing } = useForm({
        financing_id: '',
        muqasah_amount: 0,
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };
    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
    };

    const handleSelectFinancing = (f) => {
        setSelectedFinancing(f);
        setData('financing_id', f.id);
    };

    const handlePayInstallment = (schedule) => {
        if (!confirm(`Bayar angsuran ke-${schedule.installment_number} sebesar ${formatCurrency(schedule.total_amount)}?`)) return;
        post(route('financing-payments.store'), {
            data: { financing_id: selectedFinancing.id, schedule_id: schedule.id },
            onSuccess: () => setSelectedFinancing(null),
        });
    };

    const openPayoffModal = (financing) => {
        const unpaid = (financing.schedules || []).filter(s => !s.is_paid);
        const remainingMargin = unpaid.reduce((sum, s) => sum + parseFloat(s.margin_amount), 0);
        setPayoffData({ financing_id: financing.id, muqasah_amount: 0 });
        setShowPayoffModal(true);
        // Store for display
        setSelectedFinancing({ ...financing, _remainingPrincipal: unpaid.reduce((sum, s) => sum + parseFloat(s.principal_amount), 0), _remainingMargin: remainingMargin });
    };

    const handlePayoff = (e) => {
        e.preventDefault();
        postPayoff(route('financing-payments.early-payoff'), {
            onSuccess: () => { setShowPayoffModal(false); setSelectedFinancing(null); },
        });
    };

    const filteredFinancings = financings.filter(f => 
        (f.financing_number && f.financing_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.customer && f.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const muqasahAmount = parseFloat(payoffData.muqasah_amount) || 0;
    const totalToPay = selectedFinancing ? (selectedFinancing._remainingPrincipal + selectedFinancing._remainingMargin - muqasahAmount) : 0;

    return (
        <AuthenticatedLayout header="FinancingPayments">
            <Head title="Pembayaran Angsuran" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Banknote className="w-6 h-6 text-brand" />
                        Pembayaran Angsuran
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Pilih kontrak pembiayaan aktif dan proses pembayaran angsuran atau pelunasan.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari No. Ref atau Nama..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all dark:text-slate-200" />
                </div>
            </div>

            {serverErrors.message && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div><h4 className="text-sm font-bold text-red-800">Error</h4><p className="text-sm text-red-600 mt-1">{serverErrors.message}</p></div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: List Financing */}
                <div className="lg:col-span-1 space-y-3">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Kontrak Aktif</h3>
                    {filteredFinancings.length > 0 ? filteredFinancings.map(f => (
                        <div key={f.id}
                            onClick={() => handleSelectFinancing(f)}
                            className={`p-4 bg-white dark:bg-slate-900 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedFinancing?.id === f.id ? 'border-brand ring-2 ring-brand/20 shadow-md' : 'border-slate-200 dark:border-slate-800'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-brand text-sm">{f.financing_number}</p>
                                    <p className="text-xs text-slate-500 font-medium">{f.customer?.full_name}</p>
                                    <p className="text-xs text-slate-400">{f.product?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(f.total_payment)}</p>
                                    <p className="text-[10px] text-slate-500">{f.duration_months} Bulan</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full transition-all"
                                        style={{ width: `${((f.schedules || []).filter(s => s.is_paid).length / Math.max((f.schedules || []).length, 1)) * 100}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">
                                    {(f.schedules || []).filter(s => s.is_paid).length}/{(f.schedules || []).length}
                                </span>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button onClick={(e) => { e.stopPropagation(); openPayoffModal(f); }}
                                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> Pelunasan Dipercepat
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-slate-400">
                            <Banknote className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Tidak ada kontrak pembiayaan aktif.</p>
                        </div>
                    )}
                </div>

                {/* Right: Schedule Detail */}
                <div className="lg:col-span-2">
                    {selectedFinancing ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="px-6 py-4 bg-brand/5 border-b border-brand/10">
                                <h3 className="font-bold text-brand flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Jadwal Angsuran: {selectedFinancing.financing_number}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">{selectedFinancing.customer?.full_name} — {selectedFinancing.product?.name}</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Ke</th>
                                            <th className="px-4 py-3 font-semibold">Jatuh Tempo</th>
                                            <th className="px-4 py-3 font-semibold text-right">Pokok</th>
                                            <th className="px-4 py-3 font-semibold text-right">Margin</th>
                                            <th className="px-4 py-3 font-semibold text-right">Total</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {(selectedFinancing.schedules || []).map(sch => (
                                            <tr key={sch.id} className={`transition-colors ${sch.is_paid ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                                                <td className="px-4 py-3 font-bold text-center">{sch.installment_number}</td>
                                                <td className="px-4 py-3">{formatDate(sch.due_date)}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(sch.principal_amount)}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(sch.margin_amount)}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(sch.total_amount)}</td>
                                                <td className="px-4 py-3">
                                                    {sch.is_paid ? (
                                                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> LUNAS</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">BELUM</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {!sch.is_paid && (
                                                        <button onClick={() => {
                                                            setData({ financing_id: selectedFinancing.id, schedule_id: sch.id });
                                                            if (confirm(`Bayar angsuran ke-${sch.installment_number} sebesar ${formatCurrency(sch.total_amount)}?`)) {
                                                                post(route('financing-payments.store'), {
                                                                    data: { financing_id: selectedFinancing.id, schedule_id: sch.id }
                                                                });
                                                            }
                                                        }}
                                                            disabled={processing}
                                                            className="px-3 py-1.5 bg-brand hover:bg-brand-600 text-white text-xs font-medium rounded-lg transition-all shadow-sm">
                                                            Bayar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                            <CreditCard className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500">Pilih kontrak pembiayaan di sebelah kiri untuk melihat jadwal angsuran.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Pelunasan Dipercepat */}
            {showPayoffModal && selectedFinancing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPayoffModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 dark:bg-amber-900/20">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Zap className="w-5 h-5" /> Pelunasan Dipercepat & Muqasah
                            </h3>
                            <p className="text-xs text-amber-600 mt-1">Ref: {selectedFinancing.financing_number}</p>
                        </div>
                        <form onSubmit={handlePayoff} className="p-6 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Sisa Pokok:</span><span className="font-bold">{formatCurrency(selectedFinancing._remainingPrincipal)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Sisa Margin:</span><span className="font-bold text-amber-600">{formatCurrency(selectedFinancing._remainingMargin)}</span></div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Diskon Margin (Muqasah)</label>
                                <input type="number" value={payoffData.muqasah_amount} onChange={e => setPayoffData('muqasah_amount', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200 text-sm focus:ring-brand focus:border-brand"
                                    placeholder="0" min="0" max={selectedFinancing._remainingMargin} />
                                <p className="text-xs text-slate-500 mt-1">Sesuai fatwa DSN-MUI, potongan margin (Muqasah) diperbolehkan tapi tidak boleh diperjanjikan di awal akad.</p>
                            </div>

                            <div className="bg-brand/10 p-4 rounded-xl">
                                <div className="flex justify-between text-sm font-bold text-brand">
                                    <span>Total yang Harus Dibayar Nasabah:</span>
                                    <span>{formatCurrency(totalToPay > 0 ? totalToPay : 0)}</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setShowPayoffModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                                <button type="submit" disabled={payoffProcessing} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-amber-600/30 disabled:opacity-50 flex items-center gap-2">
                                    {payoffProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Proses Pelunasan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
