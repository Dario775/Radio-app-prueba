'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import { useAudio } from '@/context/AudioContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AddRadioPage() {
    const router = useRouter();
    const { addCustomRadio } = useFavorites();
    const { playStation } = useAudio();
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [favicon, setFavicon] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !url) return;

        setIsSubmitting(true);
        try {
            const newRadio = addCustomRadio(name, url, favicon);
            playStation(newRadio);
            router.push('/');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-dark border-b border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold gradient-text">Añadir Radio Personalizada</h1>
                            <p className="text-sm text-[var(--text-muted)]">Reproduce tus propios enlaces</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 py-8">
                <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Preview */}
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border)] rounded-2xl mb-4">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center overflow-hidden mb-3 border border-white/5 shadow-inner">
                                {favicon ? (
                                    <img src={favicon} alt="Preview" className="w-full h-full object-cover" onError={() => setFavicon('')} />
                                ) : (
                                    <svg className="w-10 h-10 text-[var(--primary)]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Vista previa del Logo</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5 ml-1">
                                    Nombre de la Emisora
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ej. Mi FM Favorita"
                                    className="w-full px-4 py-3 bg-black/20 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5 ml-1">
                                    URL del Stream (HTTPS)
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://servidor.com/en-vivo"
                                    className="w-full px-4 py-3 bg-black/20 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] transition-all"
                                />
                                <p className="mt-1.5 text-[11px] text-[var(--text-muted)] ml-1">
                                    Asegúrate de que la URL sea un enlace directo al stream (AAC, MP3, etc.)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5 ml-1">
                                    URL del Logo (Opcional)
                                </label>
                                <input
                                    type="url"
                                    value={favicon}
                                    onChange={(e) => setFavicon(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full px-4 py-3 bg-black/20 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold rounded-2xl shadow-lg shadow-[var(--primary)]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Añadir Emisora
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>

            <Navbar />
        </div>
    );
}
