'use client';

import { useState, useEffect } from 'react';
import { Upload, File, Trash2, Gauge, AlertCircle, CheckCircle2, Loader2, Monitor, Radio } from 'lucide-react';
import { upload } from '@vercel/blob/client';

interface AcarsFile {
    _id: string;
    type: 'exe' | 'zip';
    version: string;
    fileName: string;
    size: string;
    uploadedAt: string;
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
            // 1. Upload file directly from browser to Vercel Blob
            const extension = form.file.name.substring(form.file.name.lastIndexOf('.'));
            const fileName = `levant_va_acars_v${form.version.replace(/\./g, '_')}${extension}`;
            
            const newBlob = await upload(fileName, form.file, {
                access: 'public',
                handleUploadUrl: '/api/admin/acars/upload/token',
            });

            // 2. Save metadata to our database
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
                setMessage({ text: 'File uploaded and version data saved!', type: 'success' });
                setForm({ version: '', type: 'exe', file: null, notes: '' });
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
        if (!confirm('Are you sure you want to delete this file?')) return;

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
        <div className="space-y-6">
            <div className="glass-card p-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Gauge className="w-8 h-8 text-accent-gold" />
                    ACARS Software Management
                </h1>
                <p className="text-gray-400 mt-1">Manage the latest versions of the ACARS Tracker and X-Plane Plugin</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-blue-400" />
                            Upload New Version
                        </h2>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Version</label>
                                <input
                                    type="text"
                                    value={form.version}
                                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                                    className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-accent-gold outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Release Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, type: 'exe' })}
                                        className={`py-3 rounded-lg border font-bold transition-all flex items-center justify-center gap-2 ${
                                            form.type === 'exe' 
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                                            : 'bg-dark-800 border-white/5 text-gray-500 hover:border-white/10'
                                        }`}
                                    >
                                        <Monitor className="w-4 h-4" />
                                        ACARS (.exe)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, type: 'zip' })}
                                        className={`py-3 rounded-lg border font-bold transition-all flex items-center justify-center gap-2 ${
                                            form.type === 'zip' 
                                            ? 'bg-green-500/20 border-green-500 text-green-400' 
                                            : 'bg-dark-800 border-white/5 text-gray-500 hover:border-white/10'
                                        }`}
                                    >
                                        <Radio className="w-4 h-4" />
                                        Plugin (.zip)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Update Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-accent-gold outline-none transition-all h-24 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    {form.type === 'exe' ? 'ACARS Installer' : 'X-Plane Plugin'} File
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                                    className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent-gold outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/5 file:text-white hover:file:bg-white/10"
                                    accept={form.type === 'exe' ? '.exe' : '.zip'}
                                    required
                                />
                            </div>

                            {message.text && (
                                <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
                                    message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-accent-gold hover:bg-accent-gold/80 disabled:opacity-50 text-dark-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Upload File
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* File List */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Current Versions</h2>
                        
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
                            </div>
                        ) : files.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                                <File className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500">No software versions uploaded yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Version</th>
                                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">File Name</th>
                                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Uploaded</th>
                                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Management</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {files.map((f) => (
                                            <tr key={f._id} className="group">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        {f.type === 'exe' ? (
                                                            <Monitor className="w-4 h-4 text-blue-400" />
                                                        ) : (
                                                            <Radio className="w-4 h-4 text-green-400" />
                                                        )}
                                                        <span className="text-white font-medium">{f.type.toUpperCase()}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 font-mono text-sm text-gray-300">v{f.version}</td>
                                                <td className="py-4 text-sm text-gray-400">{f.fileName}</td>
                                                <td className="py-4 text-sm text-gray-500">
                                                    {new Date(f.uploadedAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(f._id)}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
