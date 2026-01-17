'use client';

import { useFavorites } from '@/hooks/useFavorites';
import StationCard from '@/components/StationCard';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useAudio } from '@/context/AudioContext';

export default function FavoritesPage() {
    const { favorites, customRadios, recentlyPlayed } = useFavorites();
    const { playStation } = useAudio();

    const isEmpty = favorites.length === 0 && customRadios.length === 0 && recentlyPlayed.length === 0;

    return (
        <div className="min-h-screen bg-[var(--background)] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-dark border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold gradient-text">Mi Biblioteca</h1>
                    <p className="text-sm text-[var(--text-muted)]">Tus emisoras favoritas y personalizadas</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2">Tu biblioteca está vacía</h2>
                        <p className="text-[var(--text-muted)] max-w-sm mb-8">
                            Comienza a añadir radios a tus favoritas o crea tus propias emisoras personalizadas.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/" className="px-6 py-3 bg-[var(--primary)] text-white rounded-2xl font-semibold hover:bg-[var(--primary-dark)] transition-all">
                                Descubrir Radios
                            </Link>
                            <Link href="/add-radio" className="px-6 py-3 glass rounded-2xl font-semibold hover:bg-white/10 transition-all border border-white/10">
                                Añadir Propia
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {recentlyPlayed.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-pink-500 rounded-full" />
                                        Escuchado recientemente
                                    </h2>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                    {recentlyPlayed.map((station) => (
                                        <div key={station.stationuuid} className="w-32 flex-shrink-0">
                                            <div
                                                onClick={() => playStation(station)}
                                                className="group block cursor-pointer"
                                            >
                                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-2 group-hover:border-[var(--primary)] transition-colors">
                                                    <img
                                                        src={station.favicon || `https://ui-avatars.com/api/?name=${encodeURIComponent(station.name)}&background=random`}
                                                        alt={station.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <p className="text-xs font-medium truncate text-center group-hover:text-[var(--primary)]">{station.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {customRadios.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-cyan-400 rounded-full" />
                                        Emisoras Personalizadas
                                    </h2>
                                    <span className="text-xs text-[var(--text-muted)] px-2 py-1 rounded-lg bg-white/5">{customRadios.length} emisoras</span>
                                </div>
                                <div className="grid gap-3">
                                    {customRadios.map((station) => (
                                        <StationCard key={station.stationuuid} station={station} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {favorites.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-[var(--primary)] rounded-full" />
                                        Emisoras Favoritas
                                    </h2>
                                    <span className="text-xs text-[var(--text-muted)] px-2 py-1 rounded-lg bg-white/5">{favorites.length} emisoras</span>
                                </div>
                                <div className="grid gap-3">
                                    {favorites.map((station) => (
                                        <StationCard key={station.stationuuid} station={station} />
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="pt-8">
                            <Link href="/add-radio" className="flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition-all text-[var(--text-muted)] hover:text-[var(--primary)] group">
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="font-semibold">Añadir otra radio personalizada</span>
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            <Navbar />
        </div>
    );
}
