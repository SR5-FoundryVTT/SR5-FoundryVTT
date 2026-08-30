#!/usr/bin/env node

import localization from './localization.cjs';

const [requestedLocale, ...extraArguments] = process.argv.slice(2);
if (extraArguments.length) {
    console.error('Usage: npm run locale:check -- [language]');
    process.exit(1);
}
if (requestedLocale && !localization.LOCALES.includes(requestedLocale)) {
    console.error(`Unknown locale "${requestedLocale}". Available locales: ${localization.LOCALES.join(', ')}`);
    process.exit(1);
}

try {
    const result = localization.validateLocales({ locales: requestedLocale ? [requestedLocale] : undefined });
    console.log(`Locale validation passed: ${result.locales.join(', ')}`);
    console.log(`${result.keyCount} English keys.`);
    for (const { locale, missing, extra } of result.warnings) {
        if (missing.length) console.warn(`Warning: ${locale} is missing ${missing.length} keys; Foundry will use English fallback values.`);
        for (const key of missing) console.warn(`  - ${key}`);
        if (extra.length) console.warn(`Warning: ${locale} has ${extra.length} keys not present in English.`);
        for (const key of extra) console.warn(`  - ${key}`);
    }
} catch (error) {
    console.error('Locale validation failed:');
    console.error(error.message);
    process.exit(1);
}
