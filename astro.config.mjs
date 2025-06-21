// @ts-check
import {defineConfig} from 'astro/config';

// https://astro.build/config
export default defineConfig({
    vite: {
        resolve: {
            alias: {
                '@styles': './src/styles',
                '@components': './src/components'
            }
        }
    }
});