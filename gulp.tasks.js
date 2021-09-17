'use strict';
// const fs = require('fs');
const fs = require('fs-extra');
const path = require('path');
const del = require('del');
const assign = require('lodash.assign');
const chalk = require('chalk');

// Browserify
const browserify = require('browserify');
const watchify = require('watchify');
const tsify = require('tsify');
const babelify = require('babelify');

// Sass
const gulpsass = require('gulp-sass')(require('node-sass'));
gulpsass.compiler = require('node-sass');

// Gulp
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const logger = require('gulplog');
const sourcemaps = require('gulp-sourcemaps');

// Config
const distName = 'dist';
const destFolder = path.resolve(process.cwd(), distName);
const jsBundle = 'bundle.js';

const baseArgs = {
    entries: ['./src/module/main.ts'],
    sourceType: 'module',
    debug: true,
};

/**
 * UTILITIES
 */
function getBabelConfig() {
    return JSON.parse(fs.readFileSync('.babelrc').toString());
}

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
 * BUILD
 */
async function buildJS() {
    const babel = babelify.configure(getBabelConfig());

    const buildArgs = assign({}, baseArgs, {
        transform: babel,
        plugin: tsify,
    });

    return browserify(buildArgs)
        .bundle()
        .on('log', logger.info)
        .on('error', logger.error)
        .pipe(source(jsBundle))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(destFolder));
}

/**
 * COPY ASSETS
 */
async function copyAssets() {
    gulp.src('assets/**/*').pipe(gulp.dest(path.resolve(destFolder, 'assets')));
    gulp.src('src/templates/**/*').pipe(gulp.dest(path.resolve(destFolder, 'templates')));
    gulp.src('locale/**/*').pipe(gulp.dest(path.resolve(destFolder, 'locale')));
}

/**
 * WATCH
 */
async function watch() {
    // Helper - watch the pattern, copy the output on change
    function watch(pattern, out) {
        gulp.watch(pattern).on('change', () => gulp.src(pattern).pipe(gulp.dest(path.resolve(destFolder, out))));
    }

    watch('assets/**/*', 'assets');
    watch('src/templates/**/*', 'templates');
    watch('locale/**/*', 'locale');

    gulp.watch('src/**/*.scss').on('change', async () => await buildSass());

    // Watchify setup
    const watchArgs = assign({}, watchify.args, baseArgs);
    const watcher = watchify(browserify(watchArgs));
    watcher.plugin(tsify);
    watcher.transform(babelify);
    watcher.on('log', logger.info);

    function bundle() {
        return (
            watcher
                .bundle()
                // log errors if they happen
                .on('error', logger.error.bind(logger, chalk.red('Browserify Error')))
                .pipe(source(jsBundle))
                .pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(destFolder))
        );
    }

    watcher.on('update', bundle);

    bundle();
}

/**
 * SASS
 */
async function buildSass() {
    return gulp
        .src('src/css/bundle.scss')
        .pipe(gulpsass().on('error', gulpsass.logError))
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(destFolder));
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

        if (!fs.existsSync(linkDir)) {
            console.log(
                chalk.green(`Copying build to ${chalk.blueBright(linkDir)}`)
            );
            await fs.symlink(path.resolve('./'), linkDir);
        }
        return Promise.resolve();
    } catch (err) {
        Promise.reject(err);
    }
}

exports.clean = cleanDist;
exports.sass = buildSass;
exports.assets = copyAssets;
exports.build = gulp.series(copyAssets, buildSass, buildJS);
exports.watch = gulp.series(exports.build, watch);
exports.rebuild = gulp.series(cleanDist, exports.build);
exports.link = linkUserData;
