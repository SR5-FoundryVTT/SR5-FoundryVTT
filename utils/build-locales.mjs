#!/usr/bin/env node

import localization from './localization.cjs';

try {
    const result = localization.buildLocales();
    console.log(`Built ${result.locales.length} locales with ${result.keyCount} English keys.`);
    for (const { locale, missing, extra } of result.warnings) {
        if (missing.length) console.warn(`${locale} is missing ${missing.length} keys; Foundry will use English fallback values.`);
        if (extra.length) console.warn(`${locale} has ${extra.length} keys not present in English.`);
    }
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
