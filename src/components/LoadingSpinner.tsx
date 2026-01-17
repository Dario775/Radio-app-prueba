export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`relative ${sizeClasses[size]}`}>
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)]/20" />

                {/* Spinning ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--primary)] animate-spin" />

                {/* Inner dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                </div>
            </div>
        </div>
    );
}
