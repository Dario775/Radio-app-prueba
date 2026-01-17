'use client';

import { useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';

export default function ThemeColorManager() {
    const { dominantColor } = useAudio();

    useEffect(() => {
        // Find existing meta theme-color tag or create one
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            (metaThemeColor as HTMLMetaElement).name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        // Apply dominant color, or fallback to black for the "dark immersive" feel
        const colorToApply = dominantColor || '#0a0a0a';

        // Update main theme color
        metaThemeColor.setAttribute('content', colorToApply);

        // Update Apple specific status bar
        let metaAppleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (!metaAppleStatus) {
            metaAppleStatus = document.createElement('meta');
            (metaAppleStatus as HTMLMetaElement).name = 'apple-mobile-web-app-status-bar-style';
            document.head.appendChild(metaAppleStatus);
        }
        // "black-translucent" allows the background color of the body to show through
        metaAppleStatus.setAttribute('content', 'black-translucent');

        // Also update the body background to ensure overscroll matches the theme
        // This is what creates the "invasion" effect on mobile browser overscroll
        document.body.style.backgroundColor = colorToApply;
        document.documentElement.style.backgroundColor = colorToApply;

    }, [dominantColor]);

    return null;
}
