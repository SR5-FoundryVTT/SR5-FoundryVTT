'use strict';
const fs = require('fs-extra');
const path = require('path');

// Sass
const gulpsass = require('gulp-sass')(require('sass'));

// Gulp
const util = require('util');
const gulp = require('gulp');
var cp = require('child_process');
const esbuild = require('esbuild');
const {typecheckPlugin} = require("@jgoz/esbuild-plugin-typecheck");

// Config
const distName = 'dist';
const destFolder = path.resolve(process.cwd(), distName);
const jsBundle = 'bundle.js';
const entryPoint = "./src/module/main.ts";
const includeQuench = process.env.SR5_INCLUDE_QUENCH !== 'false';
const includeQuenchEnv = includeQuench ? 'true' : 'false';

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
 */
async function buildJS() {
    esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        keepNames: true, // esbuild doesn't guarantee names of classes, so we need to inject .name with the original cls name
        minify: false, // BEWARE: minify: true will break the system as class names are used as string references
        sourcemap: true,
        format: 'esm',
        outfile: path.resolve(destFolder, jsBundle),
        define: {
            'process.env.SR5_INCLUDE_QUENCH': JSON.stringify(includeQuenchEnv),
        },
        // Don't typescheck on build. Instead typecheck on PR and push and assume releases to build.
        plugins: [],
    }).catch((err) => { console.error(err); });
}

/**
 * COPY ASSETS
 */
async function copyAssets() {
    gulp.src('public/**/*', {encoding: false}).pipe(gulp.dest(destFolder));
    gulp.src('src/templates/**/*').pipe(gulp.dest(path.resolve(destFolder, 'templates')));
    gulp.src('src/module/tours/jsons/**/*').pipe(gulp.dest(path.resolve(destFolder, 'tours')));
}

/**
 * WATCH
 */
async function watch() {
    function watchCopy(pattern, out) {
        gulp.watch(pattern).on('change', () => gulp.src(pattern).pipe(gulp.dest(path.resolve(destFolder, out))));
    }

    gulp.watch('public/**/*').on('change', () => gulp.src('public/**/*', {encoding: false}).pipe(gulp.dest(destFolder)));
    watchCopy('src/templates/**/*', 'templates');
    watchCopy('src/module/tours/jsons/**/*', 'tours');

    gulp.watch('src/**/*.scss').on('change', async () => await buildSass());

    const context = await esbuild.context({
        entryPoints: [entryPoint],
        bundle: true,
        keepNames: true, // esbuild doesn't guarantee names of classes, so we need to inject .name with the original cls name
        minify: false, // BEWARE: minify: true will break the system as class names are used as string references
        sourcemap: true,
        format: 'esm',
        outfile: path.resolve(destFolder, jsBundle),
        define: {
            'process.env.SR5_INCLUDE_QUENCH': JSON.stringify(includeQuenchEnv),
        },
        plugins: [typecheckPlugin({watch: true})],
    })

    await context.watch();
}

/**
 * SASS
 */
async function buildSass() {
    return gulp
        .src('src/css/bundle.scss')
        .pipe(gulpsass().on('error', gulpsass.logError))
        .pipe(gulp.dest(destFolder));
}

/**
 * FoundryVTT compendium/packs.
 * Create all needed packs from their source files.
 *
 * Since gulp tasks uses a commonJS file, while pack uses a es6 module, we have to use the node execution of packs.
 *
 * Rebuilding packs.mjs to be commonJS as well, would mean to deviate from the dnd5e source of it, which I avoid to
 * keep future changes on their side easier to merge.
 */
async function buildPacks() {
    try {
        const { stderr } = await util.promisify(cp.exec)('npm run build:db');
        if (stderr) console.error(stderr);
        return Promise.resolve();
    } catch (err) {
        console.error('Error building packs:', err);
        throw err;
    }
}

exports.clean = cleanDist;
exports.sass = buildSass;
exports.assets = copyAssets;
exports.build = gulp.series(copyAssets, buildSass, buildJS, buildPacks);
exports.watch = gulp.series(copyAssets, buildSass, watch);
exports.rebuild = gulp.series(cleanDist, exports.build);
