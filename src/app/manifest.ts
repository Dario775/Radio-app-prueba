import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'RadioWave - Radio en Vivo',
        short_name: 'RadioWave',
        description: 'Escucha miles de emisoras de radio en vivo de todo el mundo.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        icons: [
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '192x192',
                type: 'image/png',
            }
        ],
    }
}
