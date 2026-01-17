'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search stations...", initialValue = "" }: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Debounce search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, onSearch]);

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    return (
        <div
            className={`relative flex items-center transition-all duration-300 ${isFocused
                ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]'
                : ''
                }`}
        >
            {/* Search Icon */}
            <div className="absolute left-4 pointer-events-none">
                <svg
                    className={`w-5 h-5 transition-colors ${isFocused ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Input */}
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="w-full pl-12 pr-12 py-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none transition-all"
            />

            {/* Clear Button */}
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute right-4 p-1 rounded-full hover:bg-[var(--surface-hover)] transition-colors"
                >
                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            {/* Animated border gradient */}
            {isFocused && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--primary)] via-cyan-400 to-[var(--primary)] opacity-20 blur-sm -z-10 animate-pulse" />
            )}
        </div>
    );
}
