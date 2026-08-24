import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { ShieldAlert, Check, X, ArrowRight, UserCheck, User, Clock, FileText } from 'lucide-react';

export default function MakerChecker({ approvals, type }) {
    const [processingId, setProcessingId] = useState(null);
    const [notes, setNotes] = useState('');
    const [selectedId, setSelectedId] = useState(approvals.length > 0 ? approvals[0].id : null);

    const translateModelName = (modelName) => {
        if (modelName === 'Customer') return 'Anggota';
        if (modelName === 'SavingsAccount') return 'Rek. Simpanan';
        if (modelName === 'SavingTransaction') return 'Trx Simpanan';
        return modelName;
    };

    const selectedApproval = approvals.find(a => a.id === selectedId);

    const handleProcess = (approval, action) => {
        if (confirm(`Anda yakin ingin ${action === 'APPROVE' ? 'menyetujui' : 'menolak'} request ini?`)) {
            setProcessingId(approval.id);
            router.post(route('approvals.process', approval.id), {
                action: action,
                notes: notes
            }, {
                preserveScroll: true,
                onFinish: () => {
                    setProcessingId(null);
                    setNotes('');
                }
            });
        }
    };

    const renderDataComparison = (approval) => {
        const oldData = approval.old_data || {};
        const newData = approval.new_data || {};
        
        const allKeys = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])];
        const changes = allKeys.filter(key => oldData[key] !== newData[key] && !['created_at', 'updated_at', 'id', 'tenant_id', 'branch_id'].includes(key));

        if (changes.length === 0) return <div className="text-sm text-slate-500 italic">Tidak ada perubahan berarti.</div>;

        return (
            <div className="mt-4 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                            <th className="pb-2 font-medium w-1/3">Field</th>
                            <th className="pb-2 font-medium w-1/3 text-rose-500">Data Lama (Maker)</th>
                            <th className="pb-2 font-medium w-1/3 text-emerald-500">Data Baru (Pengajuan)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {changes.map(key => (
                            <tr key={key}>
                                <td className="py-3 font-mono text-xs text-slate-600 dark:text-slate-400 capitalize">{key.replace(/_/g, ' ')}</td>
                                <td className="py-3 text-rose-600 dark:text-rose-400 pr-2 font-medium">{oldData[key] !== undefined && oldData[key] !== null ? String(oldData[key]) : '-'}</td>
                                <td className="py-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium">
                                    <ArrowRight className="w-3 h-3 text-slate-300" />
                                    <span>{newData[key] !== undefined && newData[key] !== null ? String(newData[key]) : '-'}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <AuthenticatedLayout header="Otorisasi (Maker-Checker)">
            <Head title="Otorisasi" />

            <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
                
                {/* Left Panel: List of Approvals */}
                <div className="w-full md:w-1/3 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white leading-tight">Daftar Antrean</h2>
                            <p className="text-xs text-slate-500">{approvals.length} Menunggu Otorisasi</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        {approvals.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                                <FileText className="w-10 h-10 text-slate-300 mb-3" />
                                <p className="text-sm text-slate-500">Tidak ada pengajuan pending saat ini.</p>
                            </div>
                        ) : (
                            approvals.map(approval => (
                                <button 
                                    key={approval.id}
                                    onClick={() => setSelectedId(approval.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedId === approval.id ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50 ring-1 ring-indigo-500/20' : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/80'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-white ${approval.action === 'UPDATE' ? 'bg-amber-500' : approval.action.includes('APPROVE') || approval.action === 'CREATE' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                            {approval.action.replace('_TRANSACTION', '')}
                                        </span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(approval.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <h4 className={`text-sm font-semibold mb-1 truncate ${selectedId === approval.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {translateModelName(approval.approvable_type.split('\\').pop())} #{approval.approvable_id}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <User className="w-3.5 h-3.5" />
                                        <span className="truncate">Oleh: {approval.creator?.name || 'Unknown'}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Detail View */}
                <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {selectedApproval ? (
                        <>
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                            Detail Pengajuan {translateModelName(selectedApproval.approvable_type.split('\\').pop())}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">Review data dengan seksama sebelum melakukan persetujuan.</p>
                                    </div>
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-mono font-medium">
                                        ID: {selectedApproval.id}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                <div className="mb-6 grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <p className="text-xs text-slate-500 mb-1">Diajukan Oleh (Maker)</p>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedApproval.creator?.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{selectedApproval.creator?.email}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <p className="text-xs text-slate-500 mb-1">Waktu Pengajuan</p>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{new Date(selectedApproval.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{new Date(selectedApproval.created_at).toLocaleTimeString('id-ID')}</p>
                                    </div>
                                </div>
                                
                                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-brand" /> Rincian Data
                                </h5>
                                {renderDataComparison(selectedApproval)}
                            </div>

                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Catatan Checker (Opsional)</label>
                                <textarea 
                                    rows="2"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm mb-4 transition-shadow"
                                    placeholder="Tambahkan alasan mengapa disetujui atau ditolak..."
                                />
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => handleProcess(selectedApproval, 'REJECT')}
                                        disabled={processingId === selectedApproval.id}
                                        className="px-6 py-2.5 text-sm font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 dark:bg-slate-800 dark:hover:bg-rose-900/20 dark:border-rose-900/30 dark:text-rose-400 rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Tolak Request
                                    </button>
                                    <button
                                        onClick={() => handleProcess(selectedApproval, 'APPROVE')}
                                        disabled={processingId === selectedApproval.id}
                                        className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                                    >
                                        {processingId === selectedApproval.id ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                        Setujui Request
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <UserCheck className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih Data Pengajuan</h3>
                            <p className="text-sm text-slate-500 max-w-sm">Klik salah satu pengajuan di panel sebelah kiri untuk melihat rincian datanya dan memberikan persetujuan atau penolakan.</p>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
