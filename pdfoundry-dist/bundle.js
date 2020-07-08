(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFUtil = void 0;
/**
 * Contains various utility functions for common operations.
 */
class PDFUtil {
    /**
     * Helper method. Convert a relative URL to a absolute URL
     *  by prepending the window origin to the relative URL.
     * @param dataUrl
     */
    static getAbsoluteURL(dataUrl) {
        return `${window.origin}/${dataUrl}`;
    }
    /**
     * Pull relevant data from an item, creating a {@link PDFData}.
     * @param item The item to pull data from.
     */
    static getPDFDataFromItem(item) {
        if (item === undefined || item === null) {
            return null;
        }
        let { code, url, offset, cache } = item.data.data;
        let name = item.name;
        if (typeof offset === 'string') {
            offset = parseInt(offset);
        }
        return {
            name,
            code,
            url,
            offset,
            cache,
        };
    }
    /**
     * Returns true if the URL starts with the origin.
     * @param dataUrl A url.
     */
    static validateAbsoluteURL(dataUrl) {
        return dataUrl.startsWith(window.origin);
    }
    static getUserIdsOfRole(role) {
        return game.users
            .filter((user) => {
            return user.role === role;
        })
            .map((user) => user.id);
    }
    static getUserIdsAtLeastRole(role) {
        return game.users
            .filter((user) => {
            return user.role >= role;
        })
            .map((user) => user.id);
    }
    static getUserIdsAtMostRole(role) {
        return game.users
            .filter((user) => {
            return user.role <= role;
        })
            .map((user) => user.id);
    }
}
exports.PDFUtil = PDFUtil;
},{}],2:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFoundryAPI = void 0;
const PDFSettings_1 = require("../settings/PDFSettings");
const PDFViewer_1 = require("../viewer/PDFViewer");
const PDFCache_1 = require("../cache/PDFCache");
const PDFEvents_1 = require("../events/PDFEvents");
const PDFUtil_1 = require("./PDFUtil");
/**
 * The PDFoundry API <br>
 * You can access the API with `ui.PDFoundry`
 * @module API
 */
class PDFoundryAPI {
    /**
     * A reference to the static {@link PDFEvents} class.
     */
    static get events() {
        return PDFEvents_1.PDFEvents;
    }
    /**
     * A reference to the static {@link PDFUtil} class.
     */
    static get util() {
        return PDFUtil_1.PDFUtil;
    }
    // <editor-fold desc="GetPDFData Methods">
    /**
     * Helper method. Alias for {@link PDFoundryAPI.getPDFData} with a
     *  comparer that searches by PDF Code.
     * @param code Which code to search for a PDF with.
     */
    static getPDFDataByCode(code) {
        return PDFoundryAPI.getPDFData((item) => {
            return item.data.data.code === code;
        });
    }
    /**
     * Helper method. Alias for {@link PDFoundryAPI.getPDFData} with a
     *  comparer that searches by PDF Name.
     * @param name Which name to search for a PDF with.
     * @param caseInsensitive If a case insensitive search should be done.
     */
    static getPDFDataByName(name, caseInsensitive = true) {
        if (caseInsensitive) {
            return PDFoundryAPI.getPDFData((item) => {
                return item.name.toLowerCase() === name.toLowerCase();
            });
        }
        else {
            return PDFoundryAPI.getPDFData((item) => {
                return item.name === name;
            });
        }
    }
    /**
     * Finds a PDF entity created by the user and constructs a
     *  {@link PDFData} object of the resulting PDF's data.
     * @param comparer A comparison function that will be used.
     */
    static getPDFData(comparer) {
        const pdf = game.items.find((item) => {
            return item.type === PDFSettings_1.PDFSettings.PDF_ENTITY_TYPE && comparer(item);
        });
        return PDFUtil_1.PDFUtil.getPDFDataFromItem(pdf);
    }
    // </editor-fold>
    // <editor-fold desc="OpenPDF Methods">
    /**
     * Open the PDF with the provided code to the specified page.
     * Helper for {@link getPDFDataByCode} then {@link openPDF}.
     */
    static openPDFByCode(code, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const pdf = this.getPDFDataByCode(code);
            if (pdf === null) {
                const error = game.i18n.localize('PDFOUNDRY.ERROR.NoPDFWithCode');
                if (PDFSettings_1.PDFSettings.NOTIFICATIONS) {
                    ui.notifications.error(error);
                }
                return Promise.reject(error);
            }
            return this.openPDF(pdf, page);
        });
    }
    /**
     * Open the PDF with the provided code to the specified page.
     * Helper for {@link getPDFDataByCode} then {@link openPDF}.
     */
    static openPDFByName(name, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const pdf = this.getPDFDataByName(name);
            if (pdf === null) {
                const message = game.i18n.localize('PDFOUNDRY.ERROR.NoPDFWithName');
                const error = new Error(message);
                if (PDFSettings_1.PDFSettings.NOTIFICATIONS) {
                    ui.notifications.error(error.message);
                }
                return Promise.reject(error);
            }
            return this.openPDF(pdf, page);
        });
    }
    /**
     * Open the provided {@link PDFData} to the specified page.
     * @param pdf The PDF to open. See {@link PDFoundryAPI.getPDFData}.
     * @param page The page to open the PDF to.
     */
    static openPDF(pdf, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            let { url, offset, cache } = pdf;
            if (typeof offset === 'string') {
                offset = parseInt(offset);
            }
            if (!PDFUtil_1.PDFUtil.validateAbsoluteURL(url)) {
                url = PDFUtil_1.PDFUtil.getAbsoluteURL(url);
            }
            const viewer = new PDFViewer_1.PDFViewer(pdf);
            viewer.render(true);
            yield PDFoundryAPI._handleOpen(viewer, url, page + offset, cache);
            return viewer;
        });
    }
    /**
     * Open a URL as a PDF.
     * @param url The URL to open (must be absolute).
     * @param page Which page to open to. Must be >= 1.
     * @param cache If URL based caching should be used.
     */
    static openURL(url, page = 1, cache = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNaN(page) || page <= 0) {
                throw new Error(`Page must be > 0, but ${page} was given.`);
            }
            if (!PDFUtil_1.PDFUtil.validateAbsoluteURL(url)) {
                url = PDFUtil_1.PDFUtil.getAbsoluteURL(url);
            }
            const viewer = new PDFViewer_1.PDFViewer();
            viewer.render(true);
            yield PDFoundryAPI._handleOpen(viewer, url, page, cache);
            return viewer;
        });
    }
    static _handleOpen(viewer, url, page, cache) {
        return __awaiter(this, void 0, void 0, function* () {
            if (cache) {
                const cachedBytes = yield PDFCache_1.PDFCache.getCache(url);
                // If we have a cache hit open the cached data
                if (cachedBytes) {
                    yield viewer.open(cachedBytes, page);
                }
                else {
                    // Otherwise we should open it by url
                    yield viewer.open(url, page);
                    // And when the download is complete set the cache
                    viewer.download().then((bytes) => {
                        PDFCache_1.PDFCache.setCache(url, bytes);
                    });
                }
            }
            else {
                yield viewer.open(url, page);
            }
        });
    }
}
exports.PDFoundryAPI = PDFoundryAPI;
},{"../cache/PDFCache":4,"../events/PDFEvents":5,"../settings/PDFSettings":9,"../viewer/PDFViewer":15,"./PDFUtil":1}],3:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFItemSheet = void 0;
const PDFSettings_1 = require("../settings/PDFSettings");
const PDFoundryAPI_1 = require("../api/PDFoundryAPI");
/**
 * Extends the base ItemSheet for linked PDF viewing.
 */
class PDFItemSheet extends ItemSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = ['sheet', 'item'];
        options.width = 650;
        options.height = 'auto';
        return options;
    }
    get template() {
        return `systems/${PDFSettings_1.PDFSettings.EXTERNAL_SYSTEM_NAME}/${PDFSettings_1.PDFSettings.DIST_FOLDER}/templates/sheet/pdf-sheet.html`;
    }
    /**
     * Helper method to get a id in the html form
     * html ids are prepended with the id of the item to preserve uniqueness
     *  which is mandatory to allow multiple forms to be open
     * @param html
     * @param id
     */
    _getByID(html, id) {
        return html.parent().parent().find(`#${this.item._id}-${id}`);
    }
    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();
        buttons.unshift({
            class: 'pdf-sheet-manual',
            icon: 'fas fa-question-circle',
            label: 'Help',
            onclick: () => PDFSettings_1.PDFSettings.showHelp(),
        });
        //TODO: Standardize this to function w/ the Viewer one
        buttons.unshift({
            class: 'pdf-sheet-github',
            icon: 'fas fa-external-link-alt',
            label: 'PDFoundry',
            onclick: () => window.open('https://github.com/Djphoenix719/PDFoundry', '_blank'),
        });
        return buttons;
    }
    activateListeners(html) {
        super.activateListeners(html);
        const urlInput = this._getByID(html, 'data\\.url');
        const offsetInput = this._getByID(html, 'data\\.offset');
        // Block enter from displaying the PDF
        html.find('input').on('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
        });
        // Test button
        this._getByID(html, 'pdf-test').on('click', function (event) {
            event.preventDefault();
            let urlValue = urlInput.val();
            let offsetValue = offsetInput.val();
            if (urlValue === null || urlValue === undefined)
                return;
            if (offsetValue === null || offsetValue === undefined)
                return;
            urlValue = `${window.location.origin}/${urlValue}`;
            if (offsetValue.toString().trim() === '') {
                offsetValue = 0;
            }
            offsetValue = parseInt(offsetValue);
            PDFoundryAPI_1.PDFoundryAPI.openURL(urlValue, 5 + offsetValue, false);
        });
        // Browse button
        this._getByID(html, 'pdf-browse').on('click', function (event) {
            return __awaiter(this, void 0, void 0, function* () {
                event.preventDefault();
                const fp = new FilePicker({});
                // @ts-ignore TODO: foundry-pc-types
                fp.extensions = ['.pdf'];
                fp.field = urlInput[0];
                let urlValue = urlInput.val();
                if (urlValue !== undefined) {
                    yield fp.browse(urlValue.toString().trim());
                }
                fp.render(true);
            });
        });
    }
}
exports.PDFItemSheet = PDFItemSheet;
},{"../api/PDFoundryAPI":2,"../settings/PDFSettings":9}],4:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFCache = exports.IDBHelperError = void 0;
const PDFSettings_1 = require("../settings/PDFSettings");
const PDFLog_1 = require("../log/PDFLog");
/**
 * Error that occurs during IDB operations
 */
class IDBHelperError extends Error {
    constructor(index, store, message) {
        super(`Error in ${index}>${store}: ${message}`);
    }
}
exports.IDBHelperError = IDBHelperError;
/**
 * Class that deals with getting/setting from an indexed db
 * Mostly exists to separate logic for the PDFCache from logic
 *  dealing with the database
 */
class IDBHelper {
    constructor(indexName, storeNames, version) {
        this._indexName = `${indexName}`;
        this._storeNames = storeNames;
        this._version = version;
    }
    static createAndOpen(indexName, storeNames, version) {
        return __awaiter(this, void 0, void 0, function* () {
            const helper = new IDBHelper(indexName, storeNames, version);
            yield helper.open();
            return helper;
        });
    }
    get ready() {
        return this._db !== undefined;
    }
    newTransaction(storeName) {
        const transaction = this._db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        return { transaction, store };
    }
    open() {
        const that = this;
        return new Promise(function (resolve, reject) {
            const request = indexedDB.open(that._indexName, that._version);
            request.onsuccess = function (event) {
                that._db = this.result;
                resolve();
            };
            request.onupgradeneeded = function (event) {
                that._db = this.result;
                for (let i = 0; i < that._storeNames.length; i++) {
                    try {
                        // Create object store if it doesn't exist
                        that._db.createObjectStore(that._storeNames[i], {});
                    }
                    catch (error) {
                        // Otherwise pass
                    }
                }
                resolve();
            };
            request.onerror = function (event) {
                // @ts-ignore
                reject(event.target.error);
            };
        });
    }
    set(key, value, storeName, force = false) {
        return new Promise((resolve, reject) => {
            if (!this._db) {
                throw new IDBHelperError(this._indexName, storeName, 'Database is not initialized.');
            }
            else {
                const that = this;
                let { transaction, store } = this.newTransaction(storeName);
                // Propagate errors upwards, otherwise they fail silently
                transaction.onerror = function (event) {
                    // @ts-ignore
                    reject(event.target.error);
                };
                const keyRequest = store.getKey(key);
                keyRequest.onsuccess = function (event) {
                    // key already exists in the store
                    if (keyRequest.result) {
                        // should we force the new value by deleting the old?
                        if (force) {
                            that.del(key, storeName).then(() => {
                                ({ transaction, store } = that.newTransaction(storeName));
                                store.add(value, key);
                                resolve();
                            });
                        }
                        else {
                            throw new IDBHelperError(that._indexName, storeName, `Key ${key} already exists.`);
                        }
                    }
                    else {
                        store.add(value, key);
                        resolve();
                    }
                };
            }
        });
    }
    get(key, storeName) {
        return new Promise((resolve, reject) => {
            if (!this._db) {
                throw new IDBHelperError(this._indexName, storeName, 'Database is not initialized.');
            }
            else {
                let { transaction, store } = this.newTransaction(storeName);
                // Propagate errors upwards, otherwise they fail silently
                transaction.onerror = function (event) {
                    // @ts-ignore
                    reject(event.target.error);
                };
                const getRequest = store.get(key);
                getRequest.onsuccess = function (event) {
                    resolve(this.result);
                };
                getRequest.onerror = function (event) {
                    // @ts-ignore
                    reject(event.target.error);
                };
            }
        });
    }
    del(key, storeName) {
        return new Promise((resolve, reject) => {
            try {
                const { transaction, store } = this.newTransaction(storeName);
                transaction.onerror = function (event) {
                    // @ts-ignore
                    reject(event.target.error);
                };
                transaction.oncomplete = function (event) {
                    resolve();
                };
                store.delete(key);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    keys(storeName) {
        return new Promise((resolve, reject) => {
            try {
                const { transaction, store } = this.newTransaction(storeName);
                const keysRequest = store.getAllKeys();
                keysRequest.onsuccess = function () {
                    resolve(keysRequest.result);
                };
                keysRequest.onerror = function (event) {
                    // @ts-ignore
                    reject(event.target.error);
                };
                return;
            }
            catch (error) {
                reject(error);
            }
        });
    }
    clr(storeName) {
        return new Promise((resolve, reject) => {
            try {
                const { store } = this.newTransaction(storeName);
                const keys = store.getAllKeys();
                keys.onsuccess = (result) => {
                    const promises = [];
                    for (const key of keys.result) {
                        promises.push(this.del(key, storeName));
                    }
                    Promise.all(promises).then(() => {
                        resolve();
                    });
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
/**
 * Handles caching for PDFs
 */
class PDFCache {
    // <editor-fold desc="Static Properties">
    /**
     * Max size of the cache, defaults to 256 MB.
     */
    static get MAX_BYTES() {
        return game.settings.get(PDFSettings_1.PDFSettings.EXTERNAL_SYSTEM_NAME, 'CacheSize') * Math.pow(2, 20);
    }
    // </editor-fold>
    static initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            PDFCache._cacheHelper = yield IDBHelper.createAndOpen(PDFCache.IDB_NAME, [PDFCache.CACHE, PDFCache.META], PDFCache.IDB_VERSION);
        });
    }
    static getMeta(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield PDFCache._cacheHelper.get(key, PDFCache.META);
            }
            catch (error) {
                return null;
            }
        });
    }
    static setMeta(key, meta) {
        return __awaiter(this, void 0, void 0, function* () {
            yield PDFCache._cacheHelper.set(key, meta, PDFCache.META, true);
        });
    }
    static getCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bytes = yield PDFCache._cacheHelper.get(key, PDFCache.CACHE);
                const meta = {
                    dateAccessed: new Date().toISOString(),
                    size: bytes.length,
                };
                yield PDFCache.setMeta(key, meta);
                return bytes;
            }
            catch (error) {
                return null;
            }
        });
    }
    static setCache(key, bytes) {
        return __awaiter(this, void 0, void 0, function* () {
            const meta = {
                dateAccessed: new Date().toISOString(),
                size: bytes.length,
            };
            yield PDFCache._cacheHelper.set(key, bytes, PDFCache.CACHE, true);
            yield PDFCache.setMeta(key, meta);
            yield this.prune();
        });
    }
    static preload(key) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const cachedBytes = yield PDFCache.getCache(key);
            if (cachedBytes !== null && cachedBytes.byteLength > 0) {
                resolve();
                return;
            }
            const response = yield fetch(key);
            if (response.ok) {
                const fetchedBytes = new Uint8Array(yield response.arrayBuffer());
                if (fetchedBytes.byteLength > 0) {
                    yield PDFCache.setCache(key, fetchedBytes);
                    resolve();
                    return;
                }
                else {
                    reject('Fetch failed.');
                }
            }
            else {
                reject('Fetch failed.');
            }
        }));
    }
    static prune() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = yield this._cacheHelper.keys(PDFCache.META);
            let totalBytes = 0;
            let metas = [];
            for (const key of keys) {
                const meta = yield this._cacheHelper.get(key, PDFCache.META);
                meta.dateAccessed = Date.parse(meta.dateAccessed);
                meta.size = parseInt(meta.size);
                totalBytes += meta.size;
                metas.push({
                    key,
                    meta,
                });
            }
            metas = metas.sort((a, b) => {
                return a.meta.dateAccessed - b.meta.dateAccessed;
            });
            for (let i = 0; i < metas.length; i++) {
                if (totalBytes < PDFCache.MAX_BYTES) {
                    break;
                }
                const next = metas[i];
                yield this._cacheHelper.del(next.key, PDFCache.META);
                yield this._cacheHelper.del(next.key, PDFCache.CACHE);
                totalBytes -= next.meta.size;
                PDFLog_1.PDFLog.warn(`Pruned ${next.meta.size} bytes by deleting ${next.key}`);
            }
        });
    }
    static registerSettings() {
        game.settings.register(PDFSettings_1.PDFSettings.EXTERNAL_SYSTEM_NAME, 'CacheSize', {
            name: game.i18n.localize('PDFOUNDRY.SETTINGS.CacheSizeName'),
            scope: 'user',
            type: Number,
            hint: game.i18n.localize('PDFOUNDRY.SETTINGS.CacheSizeHint'),
            default: 256,
            config: true,
            onChange: (mb) => __awaiter(this, void 0, void 0, function* () {
                mb = Math.round(mb);
                mb = Math.max(mb, 64);
                mb = Math.min(mb, 1024);
                yield game.settings.set(PDFSettings_1.PDFSettings.EXTERNAL_SYSTEM_NAME, 'CacheSize', mb);
            }),
        });
    }
}
exports.PDFCache = PDFCache;
PDFCache.IDB_NAME = 'PDFoundry';
PDFCache.IDB_VERSION = 1;
PDFCache.CACHE = `Cache`;
PDFCache.META = `Meta`;
},{"../log/PDFLog":6,"../settings/PDFSettings":9}],5:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFEvents = void 0;
const PDFLog_1 = require("../log/PDFLog");
/**
 * @private
 */
class EventStore {
    constructor(name) {
        this._name = name;
        this._callbacks = [];
    }
    /**
     * Turn on an event callback for this event.
     * @param callback The callback to turn on
     */
    on(callback) {
        if (this._callbacks === undefined) {
            return;
        }
        for (let i = 0; i < this._callbacks.length; i++) {
            if (this._callbacks[i] === callback)
                return;
        }
        this._callbacks.push(callback);
    }
    /**
     * Turn off an event callback for this event.
     * @param callback The callback to turn off
     */
    off(callback) {
        if (this._callbacks === undefined) {
            return;
        }
        for (let i = this._callbacks.length; i >= 0; i--) {
            if (this._callbacks[i] === callback) {
                this._callbacks.splice(i, 1);
            }
        }
    }
    /**
     * Fire an event and forward the args to all handlers
     * @param args Any arguments that should be passed to handlers
     */
    fire(...args) {
        if (PDFEvents.DEBUG) {
            PDFLog_1.PDFLog.log(`<${this._name}>`);
            console.log(args);
        }
        for (const cb of this._callbacks) {
            cb(...args);
        }
    }
}
/**
 * Tracks and publishes events for PDF related occurrences.
 * This class is callable through `ui.PDFoundry.events`
 */
class PDFEvents {
    // <editor-fold desc="Setup & Initialization Events">
    /**
     * Helper method version of {@link PDFEvents.on}
     * Called when all PDFoundry init stage events are done.
     */
    static get init() {
        return PDFEvents._EVENTS['init'].on;
    }
    /**
     * Helper method version of {@link PDFEvents.on}
     * Called when all PDFoundry setup stage events are done.
     */
    static get setup() {
        return PDFEvents._EVENTS['setup'].on;
    }
    /**
     * Helper method version of {@link PDFEvents.on}
     * Called when all PDFoundry ready stage events are done.
     */
    static get ready() {
        return PDFEvents._EVENTS['ready'].on;
    }
    // </editor-fold>
    // <editor-fold desc="Viewer Events">
    /**
     * Helper method version of {@link PDFEvents.on}
     * Called when a PDF viewer begins opening
     */
    static get viewerOpen() {
        return PDFEvents._EVENTS['viewerOpen'].on;
    }
    /**
     * Helper method version of {@link PDFEvents.on}
     * Called when a PDF viewer begins closing
     */
    static get viewerClose() {
        return PDFEvents._EVENTS['viewerClose'].on;
    }
    /**
     * Helper method version of {@link PDFEvents.on}
     * Called when a PDF viewer is ready to use
     */
    static get viewerReady() {
        return PDFEvents._EVENTS['viewerReady'].on;
    }
    // </editor-fold>
    /**
     * Like @see {@link PDFEvents.on} but fires the event only once, then calls off.
     * @param event
     * @param callback
     */
    static once(event, callback) {
        const wrapper = function (...args) {
            callback(args);
            PDFEvents.off(event, wrapper);
        };
        PDFEvents.on(event, wrapper);
    }
    /**
     * Turn on an event callback for an event.
     * @param event The name of the event
     * @param callback The callback to turn on
     */
    static on(event, callback) {
        PDFEvents._EVENTS[event].on(callback);
    }
    /**
     * Turn off an event callback for an event.
     * @param event The name of the event
     * @param callback The callback to turn off
     */
    static off(event, callback) {
        PDFEvents._EVENTS[event].off(callback);
    }
    static fire(event, ...args) {
        if (PDFEvents.DEBUG) {
            PDFLog_1.PDFLog.verbose(`Firing Event: ${event}`);
            console.debug(args);
        }
        PDFEvents._EVENTS[event].fire(args);
    }
}
exports.PDFEvents = PDFEvents;
/**
 * Should every event call's event name and arguments be logged?
 */
PDFEvents.DEBUG = false;
PDFEvents._EVENTS = {
    init: new EventStore('init'),
    setup: new EventStore('setup'),
    ready: new EventStore('ready'),
    viewerOpen: new EventStore('viewerOpen'),
    viewerClose: new EventStore('viewerClose'),
    viewerReady: new EventStore('viewerReady'),
};
},{"../log/PDFLog":6}],6:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFLog = void 0;
/**
 * A console logging wrapper that includes some additional information
 *  with output to help filter messages easier.
 */
class PDFLog {
    static format(message) {
        const time = new Date();
        const pad = (n) => {
            return n >= 10 ? n : `0${n}`;
        };
        const pad_ms = (n) => {
            const s = n.toString();
            return '0000'.substring(0, 4 - s.length) + s;
        };
        const hh = pad(time.getHours());
        const mm = pad(time.getMinutes());
        const ss = pad(time.getSeconds());
        const ms = pad_ms(time.getMilliseconds());
        return `[${PDFLog.PREFIX}@${hh}:${mm}:${ss}.${ms}] ${message}`;
    }
    /**
     * Snapshot an object to preserve it's CURRENT state in console
     * Otherwise consoles 'lazy load' objects, and it is very hard
     *  to inspect their values when they were printed (sans breakpoints)
     * @param value The object to snapshot
     * @param level What logging level should be used
     */
    static snapshot(value, level = 'log') {
        const snap = JSON.parse(JSON.stringify(value));
        let fn;
        switch (level) {
            case 'log':
                fn = console.log;
                break;
            case 'warn':
                fn = console.warn;
                break;
            case 'error':
                fn = console.error;
                break;
            case 'verbose':
                fn = console.debug;
                break;
        }
        fn(PDFLog.format(':: Frozen Object ::'));
        fn(snap);
    }
    /**
     * Print a log level message to console.
     * @param message The message to print.
     */
    static log(message) {
        if (typeof message === 'string' || typeof message === 'number') {
            console.log(PDFLog.format(message));
        }
        else {
            console.log(PDFLog.format(':: Live Object ::'));
            console.log(message);
        }
    }
    /**
     * Print an info level message to console.
     * @param message The message to print.
     */
    static info(message) {
        if (typeof message === 'string' || typeof message === 'number') {
            console.info(PDFLog.format(message));
        }
        else {
            console.info(PDFLog.format(':: Live Object ::'));
            console.info(message);
        }
    }
    /**
     * Print a verbose level message to console.
     * @param message The message to print.
     */
    static verbose(message) {
        if (typeof message === 'string' || typeof message === 'number') {
            console.debug(PDFLog.format(message));
        }
        else {
            console.debug(PDFLog.format(':: Live Object ::'));
            console.debug(message);
        }
    }
    /**
     * Print a warning level message to console.
     * @param message The message to print.
     */
    static warn(message) {
        if (typeof message === 'string' || typeof message === 'number') {
            console.warn(PDFLog.format(message));
        }
        else {
            console.warn(PDFLog.format(':: Live Object ::'));
            console.warn(message);
        }
    }
    /**
     * Print a error level message to console.
     * @param message The message to print.
     */
    static error(message) {
        if (typeof message === 'string' || typeof message === 'number') {
            console.error(PDFLog.format(message));
        }
        else {
            console.error(PDFLog.format(':: Live Object ::'));
            console.error(message);
        }
    }
}
exports.PDFLog = PDFLog;
PDFLog.PREFIX = 'PDFoundry';
},{}],7:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const PDFSetup_1 = require("./setup/PDFSetup");
const PDFCache_1 = require("./cache/PDFCache");
const PDFEvents_1 = require("./events/PDFEvents");
const PDFI18n_1 = require("./settings/PDFI18n");
const PDFSettings_1 = require("./settings/PDFSettings");
const PDFSocketHandler_1 = require("./socket/PDFSocketHandler");
PDFSetup_1.PDFSetup.registerSystem();
PDFSetup_1.PDFSetup.registerAPI();
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    // Inject the css into the page
    PDFSetup_1.PDFSetup.registerCSS();
    PDFEvents_1.PDFEvents.fire('init');
    yield setup();
});
const setup = () => __awaiter(void 0, void 0, void 0, function* () {
    // Initialize the cache system, creating the DB
    yield PDFCache_1.PDFCache.initialize();
    // Load the relevant internationalization file.
    yield PDFI18n_1.PDFI18n.initialize();
    PDFEvents_1.PDFEvents.fire('setup');
});
const ready = () => __awaiter(void 0, void 0, void 0, function* () {
    // Register the PDF sheet with the class picker, unregister others
    PDFSetup_1.PDFSetup.registerPDFSheet();
    // Initialize the settings
    yield PDFSettings_1.PDFSettings.registerSettings();
    PDFSetup_1.PDFSetup.userLogin();
    PDFSocketHandler_1.PDFSocketHandler.registerHandlers();
    PDFEvents_1.PDFEvents.fire('ready');
});
Hooks.once('setup', init);
Hooks.once('ready', ready);
// <editor-fold desc="Persistent Hooks">
// preCreateItem - Setup default values for a new PDFoundry_PDF
Hooks.on('preCreateItem', PDFSettings_1.PDFSettings.preCreateItem);
// getItemDirectoryEntryContext - Setup context menu for 'Open PDF' links
Hooks.on('getItemDirectoryEntryContext', PDFSettings_1.PDFSettings.getItemContextOptions);
// renderSettings - Inject a 'Open Manual' button into help section
Hooks.on('renderSettings', PDFSettings_1.PDFSettings.onRenderSettings);
// </editor-fold>
},{"./cache/PDFCache":4,"./events/PDFEvents":5,"./settings/PDFI18n":8,"./settings/PDFSettings":9,"./setup/PDFSetup":10,"./socket/PDFSocketHandler":11}],8:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFI18n = void 0;
const PDFSettings_1 = require("./PDFSettings");
/**
 * Localization helper
 */
class PDFI18n {
    /**
     * Load the localization file for the user's language.
     */
    static initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const lang = game.i18n.lang;
            // user's language path
            const u_path = `systems/${PDFSettings_1.PDFSettings.EXTERNAL_SYSTEM_NAME}/${PDFSettings_1.PDFSettings.DIST_FOLDER}/locale/${lang}/config.json`;
            // english fallback path
            const f_path = `systems/${PDFSettings_1.PDFSettings.EXTERNAL_SYSTEM_NAME}/${PDFSettings_1.PDFSettings.DIST_FOLDER}/locale/en/config.json`;
            let json;
            try {
                json = yield $.getJSON(u_path);
            }
            catch (error) {
                // if no translation exits for the users locale the fallback
                json = yield $.getJSON(f_path);
            }
            for (const key of Object.keys(json)) {
                game.i18n.translations[key] = json[key];
            }
            // setup the fallback as english so partial translations do not display keys
            let fb_json = yield $.getJSON(f_path);
            for (const key of Object.keys(fb_json)) {
                // @ts-ignore
                game.i18n._fallback[key] = json[key];
            }
        });
    }
}
exports.PDFI18n = PDFI18n;
},{"./PDFSettings":9}],9:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFSettings = void 0;
const PDFoundryAPI_1 = require("../api/PDFoundryAPI");
const PDFLog_1 = require("../log/PDFLog");
const PDFCache_1 = require("../cache/PDFCache");
const PDFUtil_1 = require("../api/PDFUtil");
const PDFPreloadEvent_1 = require("../socket/events/PDFPreloadEvent");
/**
 * Internal settings and helper methods for PDFoundry.
 */
class PDFSettings {
    static get SOCKET_NAME() {
        return `system.${PDFSettings.EXTERNAL_SYSTEM_NAME}`;
    }
    /**
     * Setup default values for pdf entities
     * @param entity
     * @param args ignored args
     */
    static preCreateItem(entity, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            PDFLog_1.PDFLog.verbose('Pre-create item.');
            if (entity.type !== PDFSettings.PDF_ENTITY_TYPE) {
                return;
            }
            entity.img = `systems/${PDFSettings.EXTERNAL_SYSTEM_NAME}/${PDFSettings.DIST_FOLDER}/assets/pdf_icon.svg`;
        });
    }
    /**
     * Helper method to grab the id from the html object and return an item
     * @param html
     */
    static getItemFromContext(html) {
        const id = html.data('entity-id');
        return game.items.get(id);
    }
    //TODO: This shouldn't be in settings.
    /**
     * Get additional context menu icons for PDF items
     * @param html
     * @param options
     */
    static getItemContextOptions(html, options) {
        PDFLog_1.PDFLog.verbose('Getting context options.');
        if (game.user.isGM) {
            options.unshift({
                name: game.i18n.localize('PDFOUNDRY.CONTEXT.PreloadPDF'),
                icon: '<i class="fas fa-download fa-fw"></i>',
                condition: (entityHtml) => {
                    const item = PDFSettings.getItemFromContext(entityHtml);
                    if (item.type !== PDFSettings.PDF_ENTITY_TYPE) {
                        return false;
                    }
                    const { url } = item.data.data;
                    return url !== '';
                },
                callback: (entityHtml) => {
                    const item = PDFSettings.getItemFromContext(entityHtml);
                    const pdf = PDFUtil_1.PDFUtil.getPDFDataFromItem(item);
                    if (pdf === null) {
                        //TODO: Error handling
                        return;
                    }
                    const { url } = pdf;
                    const event = new PDFPreloadEvent_1.PDFPreloadEvent(null, PDFUtil_1.PDFUtil.getAbsoluteURL(url));
                    event.emit();
                    PDFCache_1.PDFCache.preload(url);
                },
            });
        }
        options.unshift({
            name: game.i18n.localize('PDFOUNDRY.CONTEXT.OpenPDF'),
            icon: '<i class="far fa-file-pdf"></i>',
            condition: (entityHtml) => {
                const item = PDFSettings.getItemFromContext(entityHtml);
                if (item.type !== PDFSettings.PDF_ENTITY_TYPE) {
                    return false;
                }
                const { url } = item.data.data;
                return url !== '';
            },
            callback: (entityHtml) => {
                const item = PDFSettings.getItemFromContext(entityHtml);
                const pdf = PDFUtil_1.PDFUtil.getPDFDataFromItem(item);
                if (pdf === null) {
                    //TODO: Error handling
                    return;
                }
                PDFoundryAPI_1.PDFoundryAPI.openPDF(pdf, 1);
            },
        });
    }
    static registerSettings() {
        PDFCache_1.PDFCache.registerSettings();
    }
    static onRenderSettings(settings, html, data) {
        PDFLog_1.PDFLog.verbose('Rendering settings.');
        const icon = '<i class="far fa-file-pdf"></i>';
        const button = $(`<button>${icon} ${game.i18n.localize('PDFOUNDRY.SETTINGS.OpenHelp')}</button>`);
        button.on('click', PDFSettings.showHelp);
        html.find('h2').last().before(button);
    }
    static showHelp() {
        return __awaiter(this, void 0, void 0, function* () {
            yield game.user.setFlag(PDFSettings.INTERNAL_MODULE_NAME, PDFSettings.HELP_SEEN_KEY, true);
            return PDFoundryAPI_1.PDFoundryAPI.openURL(`${window.origin}/systems/${PDFSettings.EXTERNAL_SYSTEM_NAME}/${PDFSettings.DIST_FOLDER}/assets/PDFoundry Manual.pdf`, 1, false);
        });
    }
}
exports.PDFSettings = PDFSettings;
/**
 * Are feedback notifications enabled? Disable if you wish
 *  to handle them yourself.
 */
PDFSettings.NOTIFICATIONS = true;
PDFSettings.DIST_FOLDER = 'pdfoundry-dist';
PDFSettings.EXTERNAL_SYSTEM_NAME = '../modules/pdfoundry';
PDFSettings.INTERNAL_MODULE_NAME = 'pdfoundry';
PDFSettings.PDF_ENTITY_TYPE = 'PDFoundry_PDF';
PDFSettings.HELP_SEEN_KEY = 'HelpSeen';
},{"../api/PDFUtil":1,"../api/PDFoundryAPI":2,"../cache/PDFCache":4,"../log/PDFLog":6,"../socket/events/PDFPreloadEvent":12}],10:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFSetup = void 0;
const PDFSettings_1 = require("../settings/PDFSettings");
const PDFItemSheet_1 = require("../app/PDFItemSheet");
const PDFoundryAPI_1 = require("../api/PDFoundryAPI");
/**
 * A collection of methods used for setting up the API & system state.
 */
class PDFSetup {
    /**
     * Register the PDFoundry APi on the UI
     */
    static registerAPI() {
        ui['PDFoundry'] = PDFoundryAPI_1.PDFoundryAPI;
    }
    /**
     * Inject the CSS file into the header, so it doesn't have to be referenced in the system.json
     */
    static registerCSS() {
        $('head').append($(`<link href="systems/${PDFSettings_1.PDFSettings.EXTERNAL_SYSTEM_NAME}/${PDFSettings_1.PDFSettings.DIST_FOLDER}/bundle.css" rel="stylesheet" type="text/css" media="all">`));
    }
    /**
     * Pulls the system name from the script tags.
     */
    static registerSystem() {
        const scripts = $('script');
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts.get(i);
            const folders = script.src.split('/');
            const distIdx = folders.indexOf(PDFSettings_1.PDFSettings.DIST_FOLDER);
            if (distIdx === -1)
                continue;
            if (folders[distIdx - 1] === 'pdfoundry')
                break;
            PDFSettings_1.PDFSettings.EXTERNAL_SYSTEM_NAME = folders[distIdx - 1];
            break;
        }
    }
    /**
     * Register the PDF sheet and unregister invalid sheet types from it.
     */
    static registerPDFSheet() {
        Items.registerSheet(PDFSettings_1.PDFSettings.INTERNAL_MODULE_NAME, PDFItemSheet_1.PDFItemSheet, {
            types: [PDFSettings_1.PDFSettings.PDF_ENTITY_TYPE],
            makeDefault: true,
        });
        // Unregister all other item sheets for the PDF entity
        const pdfoundryKey = `${PDFSettings_1.PDFSettings.INTERNAL_MODULE_NAME}.${PDFItemSheet_1.PDFItemSheet.name}`;
        const sheets = CONFIG.Item.sheetClasses[PDFSettings_1.PDFSettings.PDF_ENTITY_TYPE];
        for (const key of Object.keys(sheets)) {
            const sheet = sheets[key];
            // keep the PDFoundry sheet
            if (sheet.id === pdfoundryKey) {
                continue;
            }
            // id is MODULE.CLASS_NAME
            const [module] = sheet.id.split('.');
            Items.unregisterSheet(module, sheet.cls, {
                types: [PDFSettings_1.PDFSettings.PDF_ENTITY_TYPE],
            });
        }
    }
    static userLogin() {
        let viewed;
        try {
            viewed = game.user.getFlag(PDFSettings_1.PDFSettings.INTERNAL_MODULE_NAME, PDFSettings_1.PDFSettings.HELP_SEEN_KEY);
        }
        catch (error) {
            viewed = false;
        }
        if (viewed) {
            return;
        }
        PDFSettings_1.PDFSettings.showHelp();
    }
}
exports.PDFSetup = PDFSetup;
},{"../api/PDFoundryAPI":2,"../app/PDFItemSheet":3,"../settings/PDFSettings":9}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFSocketHandler = void 0;
const PDFLog_1 = require("../log/PDFLog");
const PDFSettings_1 = require("../settings/PDFSettings");
const PDFSetViewEvent_1 = require("./events/PDFSetViewEvent");
const PDFoundryAPI_1 = require("../api/PDFoundryAPI");
const PDFPreloadEvent_1 = require("./events/PDFPreloadEvent");
const PDFCache_1 = require("../cache/PDFCache");
class PDFSocketHandler {
    static registerHandlers() {
        // @ts-ignore
        game.socket.on(PDFSettings_1.PDFSettings.SOCKET_NAME, (event) => {
            PDFLog_1.PDFLog.warn(`Incoming Event: ${event.type}`);
            PDFLog_1.PDFLog.warn(event);
            const { userIds, type, payload } = event;
            // null = all users, otherwise check if this event effects us
            if (userIds !== null && !userIds.includes(game.userId)) {
                return;
            }
            if (type === PDFSetViewEvent_1.PDFSetViewEvent.EVENT_TYPE) {
                PDFSocketHandler.handleSetView(payload);
                return;
            }
            else if (type === PDFPreloadEvent_1.PDFPreloadEvent.EVENT_TYPE) {
                PDFSocketHandler.handlePreloadPDF(payload);
                return;
            }
            else {
                if (type.includes('PDFOUNDRY')) {
                    PDFLog_1.PDFLog.error(`Event of type ${type} has no handler.`);
                    return;
                }
            }
        });
    }
    static handleSetView(data) {
        PDFoundryAPI_1.PDFoundryAPI.openPDF(data.pdfData, data.page);
    }
    static handlePreloadPDF(data) {
        PDFCache_1.PDFCache.preload(data.url);
    }
}
exports.PDFSocketHandler = PDFSocketHandler;
},{"../api/PDFoundryAPI":2,"../cache/PDFCache":4,"../log/PDFLog":6,"../settings/PDFSettings":9,"./events/PDFPreloadEvent":12,"./events/PDFSetViewEvent":13}],12:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFPreloadEvent = void 0;
const PDFSocketEvent_1 = require("./PDFSocketEvent");
class PDFPreloadEvent extends PDFSocketEvent_1.PDFSocketEvent {
    constructor(userIds, url) {
        super(userIds);
        this.url = url;
    }
    static get EVENT_TYPE() {
        return `${super.EVENT_TYPE}/PRELOAD_PDF`;
    }
    get type() {
        return PDFPreloadEvent.EVENT_TYPE;
    }
    getPayload() {
        const payload = super.getPayload();
        payload.url = this.url;
        return payload;
    }
}
exports.PDFPreloadEvent = PDFPreloadEvent;
},{"./PDFSocketEvent":14}],13:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFSetViewEvent = void 0;
const PDFSocketEvent_1 = require("./PDFSocketEvent");
class PDFSetViewEvent extends PDFSocketEvent_1.PDFSocketEvent {
    constructor(userIds, pdfData, page) {
        super(userIds);
        this.pdfData = pdfData;
        this.page = page;
    }
    static get EVENT_TYPE() {
        return `${super.EVENT_TYPE}/SET_VIEW`;
    }
    get type() {
        return PDFSetViewEvent.EVENT_TYPE;
    }
    getPayload() {
        const payload = super.getPayload();
        payload.pdfData = this.pdfData;
        payload.page = this.page;
        return payload;
    }
}
exports.PDFSetViewEvent = PDFSetViewEvent;
},{"./PDFSocketEvent":14}],14:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFSocketEvent = void 0;
const PDFSettings_1 = require("../../settings/PDFSettings");
class PDFSocketEvent {
    constructor(userIds) {
        this.userIds = userIds;
    }
    /**
     * The type of this event.
     */
    static get EVENT_TYPE() {
        return 'PDFOUNDRY';
    }
    /**
     * Get any data that will be sent with the event.
     */
    getPayload() {
        return {};
    }
    emit() {
        // @ts-ignore
        game.socket.emit(PDFSettings_1.PDFSettings.SOCKET_NAME, {
            type: this.type,
            userIds: this.userIds,
            payload: this.getPayload(),
        });
    }
}
exports.PDFSocketEvent = PDFSocketEvent;
},{"../../settings/PDFSettings":9}],15:[function(require,module,exports){
"use strict";
/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFViewer = void 0;
const PDFSettings_1 = require("../settings/PDFSettings");
const PDFEvents_1 = require("../events/PDFEvents");
const PDFSetViewEvent_1 = require("../socket/events/PDFSetViewEvent");
const PDFUtil_1 = require("../api/PDFUtil");
class PDFViewer extends Application {
    constructor(pdfData, options) {
        super(options);
        if (pdfData === undefined) {
            pdfData = {
                name: game.i18n.localize('PDFOUNDRY.VIEWER.ViewPDF'),
                code: '',
                offset: 0,
                url: '',
                cache: false,
            };
        }
        this._pdfData = pdfData;
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = ['app', 'window-app', 'pdfoundry-viewer'];
        options.template = `systems/${PDFSettings_1.PDFSettings.EXTERNAL_SYSTEM_NAME}/pdfoundry-dist/templates/app/pdf-viewer.html`;
        options.title = game.i18n.localize('PDFOUNDRY.VIEWER.ViewPDF');
        options.width = 8.5 * 100 + 64;
        options.height = 11 * 100 + 64;
        options.resizable = true;
        return options;
    }
    // <editor-fold desc="Getters & Setters">
    /**
     * Returns a copy of the PDFData this viewer is using.
     * Changes to this data will not reflect in the viewer.
     */
    get pdfData() {
        return duplicate(this._pdfData);
    }
    get page() {
        return this._viewer.page;
    }
    set page(value) {
        this._viewer.page = value;
    }
    // </editor-fold>
    // <editor-fold desc="Foundry Overrides">
    get title() {
        let title = this._pdfData.name;
        if (this._pdfData.code !== '') {
            title = `${title} (${this._pdfData.code})`;
        }
        return title;
    }
    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();
        //TODO: Standardize this to function w/ the Item sheet one
        buttons.unshift({
            class: 'pdf-sheet-github',
            icon: 'fas fa-external-link-alt',
            label: 'PDFoundry',
            onclick: () => window.open('https://github.com/Djphoenix719/PDFoundry', '_blank'),
        });
        if (game.user.isGM) {
            //TODO: Show to individual players.
            buttons.unshift({
                class: 'pdf-sheet-show-players',
                icon: 'fas fa-eye',
                label: 'Show to Players',
                onclick: () => this.showToPlayers(),
            });
        }
        else {
            buttons.unshift({
                class: 'pdf-sheet-show-gm',
                icon: 'fas fa-eye',
                label: 'Show to GM',
                onclick: () => this.showToGM(),
            });
        }
        return buttons;
    }
    getData(options) {
        const data = super.getData(options);
        data.systemName = PDFSettings_1.PDFSettings.EXTERNAL_SYSTEM_NAME;
        return data;
    }
    activateListeners(html) {
        const _super = Object.create(null, {
            activateListeners: { get: () => super.activateListeners }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.activateListeners.call(this, html);
            this._frame = html.parent().find('iframe.pdfViewer').get(0);
            this.getViewer().then((viewer) => __awaiter(this, void 0, void 0, function* () {
                this._viewer = viewer;
                this.getEventBus().then((eventBus) => {
                    this._eventBus = eventBus;
                    // const listeners = eventBus._listeners;
                    // for (const eventName of Object.keys(listeners)) {
                    //     eventBus.on(eventName, (...args) => {
                    //         this.logEvent(eventName, args);
                    //     });
                    // }
                    // Fire the viewerReady event so the viewer may be used externally
                    PDFEvents_1.PDFEvents.fire('viewerReady', this);
                });
            }));
        });
    }
    logEvent(key, ...args) {
        console.debug(key);
        console.debug(args);
    }
    close() {
        const _super = Object.create(null, {
            close: { get: () => super.close }
        });
        return __awaiter(this, void 0, void 0, function* () {
            PDFEvents_1.PDFEvents.fire('viewerClose', this);
            return _super.close.call(this);
        });
    }
    // </editor-fold>
    /**
     * Show the current page to GMs.
     */
    showToGM() {
        const pdfData = this.pdfData;
        pdfData.offset = 0;
        // @ts-ignore
        const ids = PDFUtil_1.PDFUtil.getUserIdsOfRole(USER_ROLES.GAMEMASTER);
        const page = this.page;
        const event = new PDFSetViewEvent_1.PDFSetViewEvent(ids, pdfData, page);
        event.emit();
    }
    /**
     * Show the current page to players.
     */
    showToPlayers() {
        const pdfData = this.pdfData;
        pdfData.offset = 0;
        // @ts-ignore
        const ids = PDFUtil_1.PDFUtil.getUserIdsAtMostRole(USER_ROLES.ASSISTANT);
        const page = this.page;
        const event = new PDFSetViewEvent_1.PDFSetViewEvent(ids, pdfData, page);
        event.emit();
    }
    /**
     * Wait for the internal PDFjs viewer to be ready and usable.
     */
    getViewer() {
        if (this._viewer) {
            return Promise.resolve(this._viewer);
        }
        return new Promise((resolve, reject) => {
            let timeout;
            const returnOrWait = () => {
                // If our window has finished initializing...
                if (this._frame) {
                    // If PDFjs has finished initializing...
                    if (this._frame.contentWindow && this._frame.contentWindow['PDFViewerApplication']) {
                        const viewer = this._frame.contentWindow['PDFViewerApplication'];
                        resolve(viewer);
                        return;
                    }
                }
                // If any ifs fall through, try again in a few ms
                timeout = setTimeout(returnOrWait, 5);
            };
            returnOrWait();
        });
    }
    /**
     * Wait for the internal PDFjs eventBus to be ready and usable.
     */
    getEventBus() {
        if (this._eventBus) {
            return Promise.resolve(this._eventBus);
        }
        return new Promise((resolve, reject) => {
            this.getViewer().then((viewer) => {
                let timeout;
                const returnOrWait = () => {
                    if (viewer.eventBus) {
                        resolve(viewer.eventBus);
                        return;
                    }
                    timeout = setTimeout(returnOrWait, 5);
                };
                returnOrWait();
            });
        });
    }
    /**
     * Finish the download and return the byte array for the file.
     */
    download() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const viewer = yield this.getViewer();
            let timeout;
            const returnOrWait = () => {
                if (viewer.downloadComplete) {
                    resolve(viewer.pdfDocument.getData());
                    return;
                }
                timeout = setTimeout(returnOrWait, 50);
            };
            returnOrWait();
        }));
    }
    open(pdfSource, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const pdfjsViewer = yield this.getViewer();
            if (page) {
                pdfjsViewer.initialBookmark = `page=${page}`;
            }
            yield pdfjsViewer.open(pdfSource);
        });
    }
}
exports.PDFViewer = PDFViewer;
},{"../api/PDFUtil":1,"../events/PDFEvents":5,"../settings/PDFSettings":9,"../socket/events/PDFSetViewEvent":13}]},{},[7])

//# sourceMappingURL=bundle.js.map
