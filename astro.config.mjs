import {defineConfig} from 'astro/config';
import image from '@astrojs/image';

// https://astro.build/config
export default defineConfig({
    vite: {
        resolve: {
            alias: {
                '@components': '/src/components',
                '@img': '/public/img',
                '@styles': '/src/styles',
            }
        }
    },

    integrations: [image()],
});