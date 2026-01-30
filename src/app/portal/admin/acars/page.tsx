'use client';

import { useState, useEffect } from 'react';
import { 
    Upload, 
    File, 
    Trash2, 
    Gauge, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    Monitor, 
    Radio,
    FileCode,
    Clock,
    Info,
    History,
    Sparkles,
    Box,
    ArrowUpRight
} from 'lucide-react';
import { upload } from '@vercel/blob/client';

interface AcarsFile {
    _id: string;
    type: 'exe' | 'zip';
    version: string;
    fileName: string;
    size: string;
    uploadedAt: string;
    notes?: string;
}

export default function AdminAcarsPage() {
    const [files, setFiles] = useState<AcarsFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [form, setForm] = useState({
        version: '',
        type: 'exe' as 'exe' | 'zip',
        file: null as File | null,
        notes: ''
    });

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/acars/files');
            if (res.ok) {
                const data = await res.json();
                setFiles(data.files);
            }
        } catch (err) {
            console.error('Failed to fetch ACARS files:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.file || !form.version) return;

        setUploading(true);
        setMessage({ text: '', type: '' });

        try {
            const extension = form.file.name.substring(form.file.name.lastIndexOf('.'));
            const fileName = `levant_va_acars_v${form.version.replace(/\./g, '_')}${extension}`;
            
            const newBlob = await upload(fileName, form.file, {
                access: 'public',
                handleUploadUrl: '/api/admin/acars/upload/token',
            });

            const res = await fetch('/api/admin/acars/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: newBlob.url,
                    version: form.version,
                    type: form.type,
                    notes: form.notes,
                    fileName: form.file.name,
                    size: `${(form.file.size / (1024 * 1024)).toFixed(2)} MB`
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ text: 'New release deployed successfully!', type: 'success' });
                setForm({ version: '', type: 'exe', file: null, notes: '' });
                const fileInput = document.getElementById('software-file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                fetchFiles();
            } else {
                setMessage({ text: data.error || 'Failed to save release data', type: 'error' });
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setMessage({ text: err.message || 'An unexpected error occurred during upload', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this version? This will remove it from the database and storage.')) return;

        try {
            const res = await fetch(`/api/admin/acars/files?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchFiles();
            }
        } catch (err) {
            console.error('Failed to delete file:', err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Boutique Hero Section */}
            <div className="relative rounded-3xl overflow-hidden glass-card p-8 border border-white/10 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-gradient-to-br from-accent-gold/20 to-accent-gold/5 rounded-2xl border border-accent-gold/20 shadow-lg shadow-accent-gold/5 backdrop-blur-md">
                            <Gauge className="w-10 h-10 text-accent-gold drop-shadow-md" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400 tracking-tight">
                                ACARS Software
                            </h1>
                            <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                                Release Management Console
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex flex-col items-end">
                             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Channels</span>
                             <span className="text-white font-mono font-bold">STABLE / BETA</span>
                         </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Horizontal Deployment Panel */}
                <div className="glass-card p-1 relative overflow-hidden bg-gradient-to-b from-white/[0.05] to-transparent rounded-3xl border border-white/10 shadow-2xl">
                     <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-transparent opacity-50 pointer-events-none" />
                     
                     <div className="p-8 pb-0 relative z-10">
                        <h2 className="text-lg font-display font-bold text-white mb-2 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-accent-gold" />
                            Deploy New Release
                        </h2>
                        <p className="text-xs text-gray-500">Push a new version to the CDN.</p>
                    </div>

                    <div className="p-8 relative z-10">
                        <form onSubmit={handleUpload} className="flex flex-col lg:flex-row gap-10">
                            {/* Left Column: Metadata */}
                            <div className="flex-1 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Version Tag</label>
                                    <div className="relative group focus-within:ring-2 ring-accent-gold/20 rounded-xl transition-all">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent-gold transition-colors">
                                            <Info size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g. 1.2.0"
                                            value={form.version}
                                            onChange={(e) => setForm({ ...form, version: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-gray-600 focus:border-accent-gold/50 focus:bg-black/40 outline-none transition-all font-mono"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Build Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, type: 'exe' })}
                                            className={`py-4 rounded-xl border relative overflow-hidden group transition-all ${
                                                form.type === 'exe' 
                                                ? 'bg-accent-gold/10 border-accent-gold text-accent-gold shadow-[0_0_20px_rgba(234,179,8,0.1)]' 
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-2 relative z-10">
                                                <Monitor className={`w-6 h-6 ${form.type === 'exe' ? 'animate-bounce-subtle' : ''}`} />
                                                <span className="text-[10px] font-bold tracking-widest">APPLICATION</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, type: 'zip' })}
                                            className={`py-4 rounded-xl border relative overflow-hidden group transition-all ${
                                                form.type === 'zip' 
                                                ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center gap-2 relative z-10">
                                                <Radio className={`w-6 h-6 ${form.type === 'zip' ? 'animate-bounce-subtle' : ''}`} />
                                                <span className="text-[10px] font-bold tracking-widest">PLUGIN</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Binary File</label>
                                    <div className="relative">
                                        <input
                                            id="software-file-input"
                                            type="file"
                                            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                                            className="hidden"
                                            accept={form.type === 'exe' ? '.exe' : '.zip'}
                                            required
                                        />
                                        <label 
                                            htmlFor="software-file-input"
                                            className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 bg-white/[0.02] rounded-2xl cursor-pointer hover:border-accent-gold/30 hover:bg-accent-gold/[0.02] transition-all group overflow-hidden relative"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            
                                            <div className={`p-3 rounded-xl mb-3 transition-transform duration-500 group-hover:scale-110 ${form.file ? 'bg-accent-gold/20 text-accent-gold' : 'bg-white/5 text-gray-500'}`}>
                                                <FileCode size={24} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 tracking-wide uppercase truncate max-w-full px-4 relative z-10">
                                                {form.file ? form.file.name : `Select ${form.type === 'exe' ? '.exe' : '.zip'} file`}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Column: Notes & Action */}
                            <div className="flex-1 flex flex-col gap-6">
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Patch Notes</label>
                                    <div className="relative group focus-within:ring-2 ring-accent-gold/20 rounded-xl transition-all flex-1">
                                        <textarea
                                            placeholder="What's new in this update?"
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-accent-gold/50 focus:bg-black/40 outline-none transition-all h-full resize-none text-sm leading-relaxed scrollbar-hide min-h-[200px]"
                                        />
                                    </div>
                                </div>

                                {message.text && (
                                    <div className={`p-4 rounded-xl flex items-center gap-3 text-xs animate-in slide-in-from-top-2 border ${
                                        message.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                                    }`}>
                                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        <span className="font-medium">{message.text}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={uploading || !form.file}
                                    className="w-full bg-gradient-to-r from-accent-gold to-yellow-500 hover:from-yellow-400 hover:to-accent-gold disabled:opacity-30 disabled:cursor-not-allowed text-dark-950 font-display font-bold text-lg py-5 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center justify-center gap-3 transform active:scale-[0.98]"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="tracking-wide">Deploying...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            <span className="tracking-wide">Deploy Release</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Release History Panel */}
                <div className="glass-card rounded-3xl border border-white/10 overflow-hidden min-h-[500px] flex flex-col bg-dark-900/40 backdrop-blur-xl">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div>
                            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                                <History className="w-5 h-5 text-accent-gold" />
                                Release History
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">Manage previous and current versions.</p>
                        </div>
                        <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                            <Box size={12} className="text-accent-gold" />
                            {files.length} Versions
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                                <Loader2 className="w-10 h-10 animate-spin text-accent-gold mb-4" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">Synchronizing...</span>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 opacity-30">
                                <File className="w-16 h-16 mb-4 text-gray-600" />
                                <p className="font-bold flex items-center gap-2 text-sm tracking-widest">NO RELEASES FOUND</p>
                            </div>
                        ) : (
                            <div className="w-full">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.01] border-b border-white/5">
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Build Type</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Version Tag</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Payload Info</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {files.map((f) => (
                                            <tr key={f._id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2.5 rounded-xl border transition-all ${
                                                            f.type === 'exe' 
                                                            ? 'bg-accent-gold/5 border-accent-gold/20 text-accent-gold group-hover:bg-accent-gold/10 group-hover:border-accent-gold/40' 
                                                            : 'bg-blue-500/5 border-blue-500/20 text-blue-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/40'
                                                        }`}>
                                                            {f.type === 'exe' ? <Monitor size={18} /> : <Radio size={18} />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-white text-sm font-bold tracking-tight">
                                                                {f.type === 'exe' ? 'Desktop App' : 'Sim Plugin'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                                                                {f.type === 'exe' ? 'WINDOWS x64' : 'FSUIPC / XPUIPC'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white font-mono text-xs font-bold">
                                                                v{f.version}
                                                            </span>
                                                            {files.indexOf(f) === 0 && (
                                                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">LATEST</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-1.5 font-medium">
                                                            <Clock size={10} /> {new Date(f.uploadedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="max-w-xs">
                                                        <p className="text-gray-300 text-xs truncate font-medium group-hover:text-white transition-colors" title={f.fileName}>
                                                            {f.fileName}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter flex items-center gap-1">
                                                            <File size={10} /> {f.size}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button
                                                        onClick={() => handleDelete(f._id)}
                                                        className="p-2.5 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20 group/btn"
                                                        title="Delete Version"
                                                    >
                                                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> 
                            CDN: Vercel Blob
                        </div>
                        <div className="flex items-center gap-2">
                            REVISION: {new Date().getFullYear()}.{new Date().getMonth() + 1} 
                            <Sparkles size={10} className="text-accent-gold" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
