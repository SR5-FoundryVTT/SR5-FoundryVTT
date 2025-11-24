import path from 'path';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Change to function syntax to access 'mode'
export default defineConfig(({ mode }) => {
    return {
        publicDir: 'public',
        base: './',

        define: {
            'import.meta.env.DEV': mode === 'development',
            'import.meta.env.PROD': mode === 'production',
            'process.env.NODE_ENV': JSON.stringify(mode),
        },

        plugins: [
            tsconfigPaths(),
            checker({
                terminal: true,
                typescript: true,
                enableBuild: true, 
            }),
            viteStaticCopy({
                targets: [
                    { src: 'LICENSE', dest: '.' },
                    { src: 'README.md', dest: '.' },
                    { src: 'README-DEV.md', dest: '.' },
                    { src: 'system.json', dest: '.' },
                ],
                watch: {
                    reloadPageOnChange: true
                }
            }),
            {
                name: 'build-packs',
                writeBundle: {
                    sequential: true,
                    order: 'post',
                    async handler() {
                        if (mode === 'production') {
                            console.log('Building packs...');
                            try {
                                execSync('npm run build:db', { stdio: 'inherit' });
                            } catch (e) {
                                console.error('Close FoundryVTT before building packs.');
                            }
                        }
                    }
                }
            }
        ],

        esbuild: { keepNames: true },
        build: {
            sourcemap: true,
            minify: false,
            outDir: 'dist',
            emptyOutDir: true,
            lib: {
                entry: './src/module/main.ts',
                name: 'system',
                fileName: 'bundle',
                formats: ['es'],
            },
            watch: mode === 'development' ? { buildDelay: 100 } : null
        },
        css: { preprocessorOptions: { scss: { api: 'modern-compiler' } } },
        resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    };
});
