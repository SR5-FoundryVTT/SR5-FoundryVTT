'use strict';
const fs = require('fs-extra');
const path = require('path');
const del = import('del'); //es6m
const chalk = import('chalk'); //es6m
const tsPaths = require("esbuild-ts-paths");
const glob = require("glob");

// Sass
const gulpsass = require('gulp-sass')(require('sass'));
gulpsass.compiler = require('sass');

// Gulp
var cp = require('child_process');
const gulp = require('gulp');
// const sourcemaps = require('gulp-sourcemaps');
const esbuild = require('esbuild');
const {typecheckPlugin} = require("@jgoz/esbuild-plugin-typecheck");

// Config
const distName = 'dist';
const destFolder = path.resolve(process.cwd(), distName);
const localeFolder = path.resolve(destFolder, 'locale')
const jsBundle = 'bundle.js';
const entryPoint = "./src/module/main.ts";

/**
 * CLEAN
 * Removes all files from the dist folder
 */
async function cleanDist() {
    const files = fs.readdirSync(destFolder);
    for (const file of files) {
        await del(path.resolve(destFolder, file));
    }
}


/**
 * .\node_modules\.bin\esbuild .\src\module\main.ts --bundle --outfile=.\dist\bundle.js --sourcemap --minify --watch
 * @returns {Promise<*>}
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
        // Don't typescheck on build. Instead typecheck on PR and push and assume releases to build.
        plugins: [tsPaths()],
    }).catch((err) => {
        console.error(err)
    })
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
    // Helper - watch the pattern, copy the output on change
    function watch(pattern, out) {
        gulp.watch(pattern).on('change', () => gulp.src(pattern).pipe(gulp.dest(path.resolve(destFolder, out))));
    }

    gulp.watch('public/**/*').on('change', () => gulp.src('public/**/*').pipe(gulp.dest(destFolder)));
    watch('src/templates/**/*', 'templates');
    watch('src/module/tours/jsons/**/*', 'tours');

    gulp.watch('src/**/*.scss').on('change', async () => await buildSass());
    gulp.watch('packs/_source/**/*.scss').on('change', async () => await compil());

    const context = await esbuild.context({
            entryPoints: [entryPoint],
            bundle: true,
            keepNames: true, // esbuild doesn't guarantee names of classes, so we need to inject .name with the original cls name
            minify: false, // BEWARE: minify: true will break the system as class names are used as string references
            sourcemap: true,
            format: 'esm',
            outfile: path.resolve(destFolder, jsBundle),
            plugins: [typecheckPlugin({watch: true})],
      })

      // Enable watch mode
      await context.watch();
}

/**
 * SASS
 */
async function buildSass() {
    return gulp
        .src('src/css/bundle.scss')
        .pipe(gulpsass().on('error', gulpsass.logError))
        // NOTE: gulp-sourcemaps caused deprecation warnigns on node v22. As it's not really needed, disable it.
        // .pipe(sourcemaps.init({loadMaps: true}))
        // .pipe(sourcemaps.write('./'))
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
    cp.exec('npm run build:db');
}


async function linkUserData() {
    const config = fs.readJSONSync('foundryconfig.json');
    const projectConfig = fs.readJSONSync(path.resolve('.', 'system.json'));

    let name = projectConfig.name;
    try {
        let linkDir;
        if (config.dataPath) {
            if (!fs.existsSync(path.join(config.dataPath, 'Data')))
                throw Error('User Data path invalid, no Data directory found');

            linkDir = path.join(config.dataPath, 'Data', 'systems', name);
        } else {
            throw Error('No User Data path defined in foundryconfig.json');
        }

        if (fs.existsSync(linkDir)) {
            if (!fs.statSync(linkDir).isSymbolicLink())
                throw Error(`${chalk.blueBright(linkDir)} is not a link. Please delete or rename folder then run ${chalk.greenBright('link')} command again`);
        } else {
            console.log(
                chalk.green(`Linking build to ${chalk.blueBright(linkDir)}`)
            );
            await fs.symlink(path.resolve('./'), linkDir);
        }
        return Promise.resolve();
    } catch (err) {
        Promise.reject(err);
    }
}

function loadI18n(target, data) {
    const setProperty = (object, key, value) => {
        if (!key) return false;
        let current = object;
        const parts = key.split(".");
        const lastKey = parts.pop();

        for (const part of parts) {
            if (!(part in current)) current[part] = {};
            current = current[part];
        }

        if (!(lastKey in current) || current[lastKey] !== value) {
            current[lastKey] = value;
            return true;
        }
        return false;
    };

    const expandObject = (value, depth = 0) => {
        if (depth > 32) throw new Error("Max object expansion depth exceeded");
        if (!value || typeof value !== "object" || Array.isArray(value)) return value;

        const result = {};
        for (const [key, val] of Object.entries(value)) {
            setProperty(result, key, expandObject(val, depth + 1));
        }
        return result;
    };

    const expanded = expandObject(data);
    Object.assign(target, expanded);
}

async function buildI18n() {
    const srcDir = path.resolve("src/i18n");
    const outDir = localeFolder;
    const langs = await fs.readdir(srcDir);

    for (const lang of langs) {
        const langPath = path.join(srcDir, lang);
        if (!(await fs.stat(langPath)).isDirectory()) continue;

        const files = glob.sync(`${langPath}/**/*.json`);
        const result = {};

        for (const file of files) {
            const content = await fs.readJson(file);
            loadI18n(result, content);
        }

        await fs.ensureDir(outDir);
        await fs.writeJson(path.join(outDir, `${lang}.json`), result, { spaces: 2 });
        console.log(`✅ Built locale/${lang}.json`);
    }
}

function flattenKeys(obj, prefix = "") {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (val && typeof val === "object" && !Array.isArray(val)) {
            Object.assign(result, flattenKeys(val, fullKey));
        } else {
            result[fullKey] = val;
        }
    }
    return result;
}

async function testI18n() {
    const langDir = localeFolder;
    const files = glob.sync(`${langDir}/*.json`);
    const baseLang = "en"; // foundry-vtt fallback language

    const base = flattenKeys(await fs.readJson(path.join(langDir, `${baseLang}.json`)));

    for (const file of files) {
        const lang = path.basename(file, ".json");
        if (lang === baseLang) continue;

        const current = flattenKeys(await fs.readJson(file));
        const missing = Object.keys(base).filter(k => !(k in current));
        const extra = Object.keys(current).filter(k => !(k in base));

        console.log(`🔍 ${lang}:`);
        if (missing.length) console.warn(`  ❌ Missing keys: ${missing.length}`, missing.slice(0, 5));
        if (extra.length) console.warn(`  ⚠️ Extra keys: ${extra.length}`, extra.slice(0, 5));
        if (!missing.length && !extra.length) console.log("  ✅ All keys match.");
    }
}

exports.i18n = buildI18n;
exports["i18n:test"] = testI18n;
exports.clean = cleanDist;
exports.sass = buildSass;
exports.assets = copyAssets;
exports.build = gulp.series(copyAssets, buildSass, buildJS, buildPacks, buildI18n);
exports.watch = gulp.series(copyAssets, buildSass, buildPacks, watch);
exports.rebuild = gulp.series(cleanDist, exports.build);
exports.link = linkUserData;
