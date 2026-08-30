#!/usr/bin/env node

import localization from './localization.cjs';

const requestedLocale = process.argv[2];
if (requestedLocale && !localization.LOCALES.includes(requestedLocale)) {
    console.error(`Unknown locale "${requestedLocale}". Available locales: ${localization.LOCALES.join(', ')}`);
    process.exit(1);
}

try {
    const result = localization.validateLocales();
    const locales = requestedLocale ? [requestedLocale] : result.locales;
    console.log(`Locale validation passed: ${locales.join(', ')}`);
    console.log(`${result.keyCount} keys across ${localization.MODULES.length} modules per language.`);
} catch (error) {
    console.error('Locale validation failed:');
    console.error(error.message);
    process.exit(1);
}
