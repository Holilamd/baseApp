import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { BookMarked, ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

export default function Create({ branches, glAccounts }) {
    const { data, setData, post, processing, errors } = useForm({
        branch_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        lines: [
            { gl_account_id: '', debit: 0, credit: 0, description: '' },
            { gl_account_id: '', debit: 0, credit: 0, description: '' },
        ]
    });

    const addLine = () => {
        setData('lines', [...data.lines, { gl_account_id: '', debit: 0, credit: 0, description: '' }]);
    };

    const removeLine = (index) => {
        if (data.lines.length <= 2) return;
        const newLines = [...data.lines];
        newLines.splice(index, 1);
        setData('lines', newLines);
    };

    const updateLine = (index, field, value) => {
        const newLines = [...data.lines];
        newLines[index][field] = value;
        setData('lines', newLines);
    };

    const totalDebit = data.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isBalanced) {
            alert('Jurnal tidak balance! Total Debit harus sama dengan Total Kredit.');
            return;
        }
        post(route('journals.store'));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <AuthenticatedLayout header="Buat Jurnal Manual">
            <Head title="Buat Jurnal Manual" />
            
            <div className="max-w-4xl mx-auto pb-12">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={route('journals.index')} className="p-2 hover:bg-slate-100 rounded-full transition-colors dark:hover:bg-slate-800 text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <BookMarked className="w-6 h-6 text-brand" />
                            Buat Jurnal Manual
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Masukkan jurnal akuntansi secara manual untuk penyesuaian (adjustment).</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cabang</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5"
                                    value={data.branch_id}
                                    onChange={e => setData('branch_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Cabang --</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
                                    ))}
                                </select>
                                {errors.branch_id && <p className="text-red-500 text-sm mt-1">{errors.branch_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tanggal Transaksi</label>
                                <input 
                                    type="date"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    required
                                />
                                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Keterangan Jurnal (Header)</label>
                                <textarea 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5"
                                    rows="2"
                                    placeholder="Contoh: Biaya Operasional Listrik Bulan Agustus"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    required
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Journal Lines */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Baris Jurnal (Lines)</h3>
                            <button 
                                type="button" 
                                onClick={addLine}
                                className="text-brand hover:text-brand-dark flex items-center gap-1 text-sm font-medium bg-brand/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Tambah Baris
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-64">Akun GL</th>
                                        <th className="px-4 py-3 text-left">Keterangan Baris (Opsional)</th>
                                        <th className="px-4 py-3 text-right w-40">Debit</th>
                                        <th className="px-4 py-3 text-right w-40">Kredit</th>
                                        <th className="px-4 py-3 w-14"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.lines.map((line, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3">
                                                <select 
                                                    className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2"
                                                    value={line.gl_account_id}
                                                    onChange={e => updateLine(index, 'gl_account_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="">- Pilih Akun GL -</option>
                                                    {glAccounts.map(gl => (
                                                        <option key={gl.id} value={gl.id}>{gl.account_number} - {gl.account_name || gl.name}</option>
                                                    ))}
                                                </select>
                                                {errors[`lines.${index}.gl_account_id`] && <p className="text-red-500 text-xs mt-1">Wajib</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="text"
                                                    className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2"
                                                    placeholder="Sama dengan header jika kosong"
                                                    value={line.description}
                                                    onChange={e => updateLine(index, 'description', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    className="w-full text-sm text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2"
                                                    value={line.debit}
                                                    onChange={e => {
                                                        updateLine(index, 'debit', e.target.value);
                                                        if (e.target.value > 0) updateLine(index, 'credit', 0);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    className="w-full text-sm text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2"
                                                    value={line.credit}
                                                    onChange={e => {
                                                        updateLine(index, 'credit', e.target.value);
                                                        if (e.target.value > 0) updateLine(index, 'debit', 0);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button 
                                                    type="button"
                                                    onClick={() => removeLine(index)}
                                                    disabled={data.lines.length <= 2}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50 dark:bg-slate-800/30">
                                        <td colSpan="2" className="px-4 py-4 text-right font-bold text-slate-700 dark:text-slate-300">
                                            TOTAL
                                        </td>
                                        <td className="px-4 py-4 text-right font-bold text-emerald-600">
                                            {formatCurrency(totalDebit)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-bold text-amber-600">
                                            {formatCurrency(totalCredit)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        {errors.message && (
                            <div className="p-4 bg-red-50 border-t border-red-100 text-red-600 text-sm">
                                {errors.message}
                            </div>
                        )}
                        {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
                            <div className="p-4 bg-amber-50 border-t border-amber-100 text-amber-700 text-sm flex items-center gap-2">
                                <span className="font-semibold">Perhatian:</span> Total Debit dan Kredit harus sama (Balance) sebelum dapat disimpan.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Link 
                            href={route('journals.index')} 
                            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </Link>
                        <button 
                            type="submit" 
                            disabled={processing || !isBalanced}
                            className="px-6 py-2.5 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            Simpan Jurnal
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
