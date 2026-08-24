import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Store, Power, Calendar, AlertCircle } from 'lucide-react';

export default function BranchOperations({ branches }) {
    
    const toggleStatus = (branch) => {
        const newStatus = branch.operational_status === 'OPEN' ? 'CLOSED' : 'OPEN';
        let newDate = branch.operational_date;
        
        if (newStatus === 'OPEN') {
            // Jika buka cabang, set tanggal hari ini
            newDate = new Date().toISOString().split('T')[0];
        }

        if (confirm(`Anda yakin ingin mengubah status cabang ${branch.name} menjadi ${newStatus}?`)) {
            router.put(route('branch-operations.update', branch.id), {
                operational_status: newStatus,
                operational_date: newDate
            });
        }
    };

    return (
        <AuthenticatedLayout header="Buka/Tutup Cabang (BOD/EOD)">
            <Head title="Operasional Cabang" />

            <div className="max-w-5xl mx-auto space-y-6">
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                        <strong className="block mb-1">Informasi Penting Operasional</strong>
                        Transaksi jurnal dan simpanan hanya dapat diproses jika status Cabang adalah <strong>OPEN (Buka)</strong>. 
                        Pastikan untuk melakukan <strong>End of Day (Tutup Cabang)</strong> setiap sore hari setelah rekonsiliasi kas selesai.
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.map(branch => (
                        <div key={branch.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                            
                            {/* Decorative Background */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 transition-colors ${branch.operational_status === 'OPEN' ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}></div>
                            
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                        <Store className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">{branch.name}</h3>
                                        <p className="text-xs font-mono text-slate-500">Kode: {branch.code}</p>
                                    </div>
                                </div>
                                <div className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-full ${branch.operational_status === 'OPEN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                                    {branch.operational_status || 'CLOSED'}
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Tanggal Operasional</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{branch.operational_date || '-'}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleStatus(branch)}
                                className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                                    branch.operational_status === 'OPEN' 
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                }`}
                            >
                                <Power className="w-4 h-4" />
                                {branch.operational_status === 'OPEN' ? 'Tutup Cabang (EOD)' : 'Buka Cabang (BOD)'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
