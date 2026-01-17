import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'RadioWave - Live Streaming',
        short_name: 'RadioWave',
        description: 'Listen to thousands of live radio stations worldwide.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0b',
        theme_color: '#00bdc7',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: 'https://ui-avatars.com/api/?name=RW&background=00bdc7&color=fff&size=512',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
