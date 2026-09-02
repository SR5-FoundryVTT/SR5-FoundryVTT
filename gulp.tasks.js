'use strict';
const fs = require('fs-extra');
const path = require('path');
const { finished } = require('stream/promises');

// Sass
const gulpsass = require('gulp-sass')(require('sass'));

// Gulp
const gulp = require('gulp');
const cp = require('child_process');
const esbuild = require('esbuild');
const localization = require('./utils/localization.cjs');

// Config
const distName = 'dist';
const destFolder = path.resolve(process.cwd(), distName);
const jsBundle = 'bundle.js';
const entryPoint = path.resolve(process.cwd(), 'src/module/main.ts');
const typescriptPackagePath = require.resolve('typescript/package.json');
const tscScriptPath = path.join(path.dirname(typescriptPackagePath), 'bin', 'tsc');

/**
 * CLEAN
 * Removes all files from the dist folder
 */
async function cleanDist() {
    if (await fs.pathExists(destFolder))
        await fs.emptyDir(destFolder);
}

/**
 * JS BUILD
 * @param {string} env - 'prod' or 'dev' to set the environment variable for the build
 */
async function buildJS(env) {
    await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        keepNames: true, // esbuild doesn't guarantee names of classes, so we need to inject .name with the original cls name
        minify: false, // BEWARE: minify: true will break the system as class names are used as string references
        sourcemap: true,
        format: 'esm',
        outfile: path.resolve(destFolder, jsBundle),
        define: {
            'process.env.ENV': JSON.stringify(env),
        },
        plugins: [],
    });
}

function startTypeCheckWatch() {
    const tscArgs = ['-p', 'tsconfig.json', '--noEmit', '--watch', '--preserveWatchOutput'];
    const tsc = cp.spawn(process.execPath, [tscScriptPath, ...tscArgs], {
        stdio: 'inherit',
        windowsHide: true,
    });

    const stopTsc = () => {
        try {
            if (process.platform === 'win32')
                cp.execFileSync('taskkill', ['/pid', String(tsc.pid), '/t', '/f'], { stdio: 'ignore' });
            else
                tsc.kill('SIGTERM');
        } catch (_err) { /* Ignore errors when killing the process, as it might have already exited */ }
    };

    process.once('exit', stopTsc);
    process.once('SIGINT', () => { stopTsc(); process.exit(130); });
    process.once('SIGTERM', () => { stopTsc(); process.exit(143); });

    tsc.on('error', (err) => {
        console.error('Error running tsc watch:', err);
    });

    tsc.on('exit', (code) => {
        if (code) console.error(`tsc watch exited with code ${code}`);
    });
}

const buildJSProd = () => buildJS('prod');
const buildJSDev = () => buildJS('dev');

/**
 * COPY ASSETS
 */
async function copyAssets() {
    await Promise.all([
        finished(gulp.src('public/**/*', {encoding: false}).pipe(gulp.dest(destFolder))),
        finished(gulp.src('src/templates/**/*').pipe(gulp.dest(path.resolve(destFolder, 'templates')))),
        finished(gulp.src('src/module/tours/jsons/**/*').pipe(gulp.dest(path.resolve(destFolder, 'tours')))),
    ]);
}

/**
 * Assemble the modular locale sources into the files loaded by Foundry.
 */
async function buildLocales() {
    localization.buildLocales(path.resolve(destFolder, 'locale'));
}

/**
 * WATCH
 * @param {string} env - 'prod' or 'dev' to set the environment variable for the build
 */
async function watch(env) {
    function watchCopy(pattern, sourceRoot, outputRoot) {
        const watcher = gulp.watch(pattern);
        const copy = async (sourcePath) => {
            const relativePath = path.relative(path.resolve(sourceRoot), path.resolve(sourcePath));
            if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
                throw new Error(`Refusing to copy watched path outside ${sourceRoot}: ${sourcePath}`);
            }
            await fs.copy(sourcePath, path.resolve(destFolder, outputRoot, relativePath), { overwrite: true });
        };
        const remove = async (sourcePath) => {
            const relativePath = path.relative(path.resolve(sourceRoot), path.resolve(sourcePath));
            if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
                throw new Error(`Refusing to remove watched path outside ${sourceRoot}: ${sourcePath}`);
            }
            await fs.remove(path.resolve(destFolder, outputRoot, relativePath));
        };
        const run = (operation) => (sourcePath) => operation(sourcePath).catch((error) => console.error(error));

        watcher.on('add', run(copy));
        watcher.on('change', run(copy));
        watcher.on('unlink', run(remove));
        return watcher;
    }

    watchCopy('public/**/*', 'public', '');
    watchCopy('src/templates/**/*', 'src/templates', 'templates');
    watchCopy('src/module/tours/jsons/**/*', 'src/module/tours/jsons', 'tours');

    const localeWatcher = gulp.watch('src/locale/**/*.json');
    const rebuildLocales = () => buildLocales().catch((error) => console.error(error));
    localeWatcher.on('add', rebuildLocales);
    localeWatcher.on('change', rebuildLocales);
    localeWatcher.on('unlink', rebuildLocales);

    const sassWatcher = gulp.watch('src/**/*.scss');
    const rebuildSass = () => buildSass().catch((error) => console.error(error));
    sassWatcher.on('add', rebuildSass);
    sassWatcher.on('change', rebuildSass);
    sassWatcher.on('unlink', rebuildSass);

    const context = await esbuild.context({
        entryPoints: [entryPoint],
        bundle: true,
        keepNames: true, // esbuild doesn't guarantee names of classes, so we need to inject .name with the original cls name
        minify: false, // BEWARE: minify: true will break the system as class names are used as string references
        sourcemap: true,
        format: 'esm',
        outfile: path.resolve(destFolder, jsBundle),
        define: {
            'process.env.ENV': JSON.stringify(env),
        },
        plugins: [],
    });

    startTypeCheckWatch();
    await context.watch();
}

const watchProd = () => watch('prod');
const watchDev = () => watch('dev');

/**
 * SASS
 */
async function buildSass() {
    await finished(
        gulp
            .src('src/css/bundle.scss')
            .pipe(gulpsass().on('error', gulpsass.logError))
            .pipe(gulp.dest(destFolder)),
    );
}

exports.clean = cleanDist;
exports.sass = buildSass;
exports.assets = copyAssets;
exports.locales = buildLocales;
exports.build = gulp.series(cleanDist, gulp.parallel(copyAssets, buildLocales), buildSass, buildJSProd);
exports.buildDev = gulp.series(cleanDist, gulp.parallel(copyAssets, buildLocales), buildSass, buildJSDev);
exports.buildProd = gulp.series(cleanDist, gulp.parallel(copyAssets, buildLocales), buildSass, buildJSProd);
exports.watch = gulp.series(gulp.parallel(copyAssets, buildLocales), buildSass, watchDev);
exports.watchProd = gulp.series(gulp.parallel(copyAssets, buildLocales), buildSass, watchProd);
exports.watchDev = gulp.series(gulp.parallel(copyAssets, buildLocales), buildSass, watchDev);
exports.rebuild = exports.build;
