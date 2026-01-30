'use client';

import { useState, useEffect } from 'react';
import { 
    Trash2, 
    Download, 
    ExternalLink, 
    Search, 
    File, 
    FileType, 
    Calendar, 
    Database,
    Loader2,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Palette,
    ArrowUpCircle,
    HardDrive,
    Sparkles,
    LayoutGrid,
    Box,
    Cloud
} from 'lucide-react';

interface BlobFile {
    url: string;
    pathname: string;
    size: number;
    uploadedAt: string;
}

export default function FileManagerPage() {
    const [files, setFiles] = useState<BlobFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/files');
            if (res.ok) {
                const data = await res.json();
                setFiles(data.files || []);
            } else {
                setMessage({ text: 'Failed to load files', type: 'error' });
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setMessage({ text: 'An error occurred while fetching files', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
            setMessage({ text: 'Only .zip packages are allowed here', type: 'error' });
            return;
        }

        setUploading(true);
        setMessage({ text: '', type: '' });

        try {
            const { upload } = await import('@vercel/blob/client');
            const newBlob = await upload(selectedFile.name, selectedFile, {
                access: 'public',
                handleUploadUrl: '/api/admin/acars/upload/token',
            });

            if (newBlob) {
                // Send Discord notification
                await fetch('/api/admin/files/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: selectedFile.name,
                        url: newBlob.url,
                        size: formatSize(selectedFile.size)
                    })
                });

                setMessage({ text: `Package deployed: ${selectedFile.name}`, type: 'success' });
                setSelectedFile(null);
                const fileInput = document.getElementById('zip-upload-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                fetchFiles();
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setMessage({ text: 'Upload failed: ' + err.message, type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (url: string) => {
        if (!confirm('Are you sure you want to delete this skin package?')) return;

        setDeletingUrl(url);
        try {
            const res = await fetch(`/api/admin/files?url=${encodeURIComponent(url)}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessage({ text: 'File removed from CDN', type: 'success' });
                fetchFiles();
            } else {
                const data = await res.json();
                setMessage({ text: data.error || 'Delete failed', type: 'error' });
            }
        } catch (err) {
            console.error('Delete error:', err);
            setMessage({ text: 'Delete operation failed', type: 'error' });
        } finally {
            setDeletingUrl(null);
        }
    };

    const filteredFiles = files.filter(f => 
        f.pathname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (pathname: string) => {
        const ext = pathname.split('.').pop()?.toLowerCase();
        if (['zip', 'rar', '7z'].includes(ext || '')) return <Palette className="w-5 h-5 text-accent-gold" />;
        return <File className="w-5 h-5 text-gray-400" />;
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
                            <Cloud className="w-10 h-10 text-accent-gold drop-shadow-md" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400 tracking-tight">
                                Skin Manager
                            </h1>
                            <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
                                Centralized Asset Cloud
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={fetchFiles}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all ring-1 ring-white/5 group active:scale-95"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Top Section: Upload & Stats Side-by-Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card p-1 relative overflow-hidden bg-gradient-to-b from-white/[0.05] to-transparent rounded-3xl border border-white/10 shadow-2xl h-full">
                         <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-transparent opacity-50 pointer-events-none" />
                         
                        <div className="p-6 pb-0 relative z-10">
                            <h2 className="text-lg font-display font-bold text-white mb-1 flex items-center gap-2">
                                <ArrowUpCircle className="w-5 h-5 text-accent-gold" />
                                Quick Deployment
                            </h2>
                            <p className="text-xs text-gray-500">Push .zip skin packages.</p>
                        </div>

                        <div className="p-6 relative z-10">
                            <form onSubmit={handleUpload} className="space-y-6">
                                <div className="relative group/upload">
                                    <input 
                                        id="zip-upload-input"
                                        type="file"
                                        accept=".zip"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <label 
                                        htmlFor="zip-upload-input"
                                        className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 bg-white/[0.02] rounded-3xl cursor-pointer hover:bg-accent-gold/[0.02] hover:border-accent-gold/30 transition-all text-center group-focus-within:border-accent-gold/50 relative overflow-hidden group-hover/upload:shadow-[0_0_30px_rgba(234,179,8,0.05)]"
                                    >
                                        <div className={`p-3 rounded-2xl mb-3 transition-all duration-500 relative z-10 ${selectedFile ? 'bg-accent-gold/20 text-accent-gold scale-110' : 'bg-white/5 text-gray-500 group-hover/upload:bg-accent-gold/10 group-hover/upload:text-accent-gold group-hover/upload:scale-110'}`}>
                                            <Palette size={24} />
                                        </div>
                                        <span className="text-sm font-bold text-white px-4 relative z-10 tracking-wide">
                                            {selectedFile ? selectedFile.name : 'Drop Package Here'}
                                        </span>
                                        <span className="mt-2 text-[10px] text-gray-500 font-bold tracking-widest uppercase relative z-10">
                                            .ZIP ARCHIVES ONLY
                                        </span>
                                    </label>
                                </div>

                                {message.text && (
                                    <div className={`p-4 rounded-xl flex items-center gap-3 text-xs animate-in slide-in-from-top-2 border ${
                                        message.type === 'success' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/5 text-rose-400 border-rose-500/20'
                                    }`}>
                                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        <span className="flex-1 font-medium">{message.text}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!selectedFile || uploading}
                                    className="w-full py-4 bg-gradient-to-r from-accent-gold to-yellow-500 hover:from-yellow-400 hover:to-accent-gold disabled:opacity-30 disabled:cursor-not-allowed text-dark-950 font-display font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center justify-center gap-3 transform active:scale-[0.99]"
                                >
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpCircle size={18} />}
                                    <span className="tracking-wide">{uploading ? 'PUSHING...' : 'PUSH TO CDN'}</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="glass-card p-6 border border-white/10 rounded-3xl bg-dark-900/40 backdrop-blur-md flex flex-col justify-center h-full">
                        <div className="mb-6">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Database size={14} className="text-accent-gold" />
                                Storage Metrics
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.05] transition-colors group flex flex-col justify-center text-center">
                                <span className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 group-hover:text-accent-gold transition-colors">Total Assets</span>
                                <span className="text-4xl font-display font-bold text-white">{files.length}</span>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.05] transition-colors group flex flex-col justify-center text-center">
                                <span className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2 group-hover:text-accent-gold transition-colors">Total Volume</span>
                                <span className="text-4xl font-display font-bold text-white">
                                    {formatSize(files.reduce((acc, f) => acc + f.size, 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Browser Full Width */}
                <div className="glass-card flex-1 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-dark-900/40 backdrop-blur-xl min-h-[600px]">
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02]">
                        <div>
                            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                                <LayoutGrid className="w-5 h-5 text-accent-gold" />
                                Cloud Browser
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">Manage deployed skin assets.</p>
                        </div>
                        <div className="relative w-full sm:w-96 group focus-within:ring-2 ring-accent-gold/20 rounded-xl transition-all">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-accent-gold transition-colors" />
                            <input 
                                type="text"
                                placeholder="Filter by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-gray-600 focus:border-accent-gold/40 focus:bg-black/30 transition-all outline-none font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <Loader2 className="w-10 h-10 animate-spin text-accent-gold mb-4" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Synchronizing Cloud Index...</span>
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 opacity-30">
                                <Palette className="w-16 h-16 mb-4 text-gray-600" />
                                <p className="font-bold text-sm uppercase tracking-widest text-gray-400">
                                    {searchQuery ? 'NO MATCHING ASSETS' : 'STORAGE IS EMPTY'}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.01] border-b border-white/5">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Asset Package</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Payload</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Uploaded</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredFiles.map((file) => (
                                        <tr key={file.url} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-accent-gold/20 group-hover:bg-accent-gold/5 transition-all">
                                                        {getFileIcon(file.pathname)}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="text-sm font-bold text-white truncate max-w-[200px] tracking-tight group-hover:text-accent-gold transition-colors" title={file.pathname}>
                                                            {file.pathname}
                                                        </div>
                                                        <a 
                                                            href={file.url} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="text-[10px] text-gray-500 hover:text-white transition-colors flex items-center gap-1 mt-1 font-mono"
                                                        >
                                                            {file.url.substring(0, 30)}... <ExternalLink size={10} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-mono font-bold text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                                    {formatSize(file.size)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                                    <Calendar size={12} className="text-gray-600" />
                                                    {new Date(file.uploadedAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-end items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <a 
                                                        href={file.url} 
                                                        download 
                                                        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
                                                        title="Download Package"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                    <button 
                                                        disabled={deletingUrl === file.url}
                                                        onClick={() => handleDelete(file.url)}
                                                        className="p-2.5 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20 disabled:opacity-50"
                                                        title="Purge from CDN"
                                                    >
                                                        {deletingUrl === file.url ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                    <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> CDN Live</div>
                        <div>SECURE STORAGE</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
