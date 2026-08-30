#!/usr/bin/env node

import localization from './localization.cjs';

try {
    const result = localization.buildLocales();
    console.log(`Built ${result.locales.length} locales with ${result.keyCount} keys each.`);
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
