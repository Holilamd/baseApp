import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    FileText, 
    FileSpreadsheet, 
    FileEdit, 
    Download, 
    Layers, 
    Info, 
    CheckCircle2
} from 'lucide-react';

export default function Reports() {
    const reportCards = [
        {
            title: 'User Access List (PDF)',
            description: 'Download a beautifully formatted document containing the top 30 active users, their roles, and joined dates. Perfect for prints or executive summaries.',
            format: 'PDF (.pdf)',
            badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
            icon: FileText,
            iconColor: 'text-red-500 bg-red-500/10',
            downloadUrl: '/reports/export/pdf'
        },
        {
            title: 'Full User Directory (Excel)',
            description: 'Download the complete spreadsheet list containing up to 100 users, mapped roles, and timestamps. Pre-formatted with auto-fit columns.',
            format: 'Excel Spreadsheet (.xlsx)',
            badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            icon: FileSpreadsheet,
            iconColor: 'text-emerald-500 bg-emerald-500/10',
            downloadUrl: '/reports/export/excel'
        },
        {
            title: 'Roles & Policies (Word)',
            description: 'Export system security roles and their associated permission policies as an editable Word document. Perfect for official auditing purposes.',
            format: 'Word Document (.docx)',
            badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            icon: FileEdit,
            iconColor: 'text-blue-500 bg-blue-500/10',
            downloadUrl: '/reports/export/word'
        }
    ];

    return (
        <AuthenticatedLayout header="Reports Showcase">
            <Head title="Export Reports" />

            <div className="space-y-8 font-sans max-w-6xl">
                {/* Header Intro Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-10">
                    <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="relative z-10 space-y-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                            <Layers className="w-3.5 h-3.5" />
                            Reusable Reporting Engine
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Boilerplate Report Exports
                        </h2>
                        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                            Generate and download system documents instantly. The reporting engine automatically connects to active database models (Users, Roles) and renders them in high-fidelity custom formats.
                        </p>
                    </div>
                </div>

                {/* Report Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reportCards.map((card, idx) => (
                        <div 
                            key={idx}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 group"
                        >
                            <div className="space-y-4">
                                {/* Header badge & Format Tag */}
                                <div className="flex justify-between items-center">
                                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${card.badgeColor}`}>
                                        {card.format}
                                    </span>
                                    <div className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 ${card.iconColor}`}>
                                        <card.icon className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">
                                        {card.title}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>
                            </div>

                            {/* Download Action Button */}
                            <div className="pt-6">
                                <a
                                    href={card.downloadUrl}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover active:scale-[0.98] transition-all shadow-sm shadow-brand/10 border border-transparent"
                                >
                                    <Download className="w-4 h-4" />
                                    Download File
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Developer Integration Tip */}
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">Developer Integration Information</h5>
                        <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">
                            These endpoints stream outputs directly, saving server memory. You can configure logos, font styles, custom page headers, and columns. Check out the step-by-step developer guide located at <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-blue-400 font-semibold font-mono">reports_guide.md</code> in your workspace root directory.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
