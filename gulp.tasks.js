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

// Config
const distName = 'dist';
const destFolder = path.resolve(process.cwd(), distName);
const jsBundle = 'bundle.js';
const entryPoint = path.resolve(process.cwd(), 'src/module/main.ts');
const tsgoPackagePath = require.resolve('@typescript/native-preview/package.json');
const tsgoScriptPath = path.join(path.dirname(tsgoPackagePath), 'bin', 'tsgo');

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

function startTsgoWatch() {
    const tsgoArgs = ['-p', 'tsconfig.json', '--noEmit', '--watch', '--preserveWatchOutput'];
    const tsgo = cp.spawn(process.execPath, [tsgoScriptPath, ...tsgoArgs], {
        stdio: 'inherit',
        windowsHide: true,
    });

    const stopTsgo = () => {
        try {
            if (process.platform === 'win32')
                cp.execFileSync('taskkill', ['/pid', String(tsgo.pid), '/t', '/f'], { stdio: 'ignore' });
            else
                tsgo.kill('SIGTERM');
        } catch (_err) { /* Ignore errors when killing the process, as it might have already exited */ }
    };

    process.once('exit', stopTsgo);
    process.once('SIGINT', () => { stopTsgo(); process.exit(130); });
    process.once('SIGTERM', () => { stopTsgo(); process.exit(143); });

    tsgo.on('error', (err) => {
        console.error('Error running tsgo watch:', err);
    });

    tsgo.on('exit', (code) => {
        if (code) console.error(`tsgo watch exited with code ${code}`);
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
        const run = (operation) => (sourcePath) => operation(sourcePath).catch((error) => watcher.emit('error', error));

        watcher.on('add', run(copy));
        watcher.on('change', run(copy));
        watcher.on('unlink', run(remove));
        return watcher;
    }

    watchCopy('public/**/*', 'public', '');
    watchCopy('src/templates/**/*', 'src/templates', 'templates');
    watchCopy('src/module/tours/jsons/**/*', 'src/module/tours/jsons', 'tours');

    const sassWatcher = gulp.watch('src/**/*.scss');
    const rebuildSass = () => buildSass().catch((error) => sassWatcher.emit('error', error));
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

    startTsgoWatch();
    await context.watch();
}

const watchProd = () => watch('prod');
const watchDev = () => watch('dev');

/**
 * SASS
 */
async function buildSass() {
    return gulp
        .src('src/css/bundle.scss')
        .pipe(gulpsass().on('error', gulpsass.logError))
        .pipe(gulp.dest(destFolder));
}

exports.clean = cleanDist;
exports.sass = buildSass;
exports.assets = copyAssets;
exports.build = gulp.series(cleanDist, copyAssets, buildSass, buildJSProd);
exports.buildDev = gulp.series(copyAssets, buildSass, buildJSDev);
exports.buildProd = gulp.series(cleanDist, copyAssets, buildSass, buildJSProd);
exports.watch = gulp.series(copyAssets, buildSass, watchDev);
exports.watchProd = gulp.series(copyAssets, buildSass, watchProd);
exports.watchDev = gulp.series(copyAssets, buildSass, watchDev);
exports.rebuild = gulp.series(cleanDist, exports.build);
