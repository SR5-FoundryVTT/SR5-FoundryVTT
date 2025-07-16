import * as englishTranslations from '../../../src/i18n/en/config.json';
import { NestedKeys } from './types';
// import * as germanTranslations from '../../../public/locale/de/config.json';
// import * as koreanTranslations from '../../../public/locale/ko/config.json';
// import * as portTranslations from '../../../public/locale/pt-BR/config.json';
// import * as frenchTranslations from '../../../public/locale/fr/config.json';

// Type encompassing all translated strings, flattening nested objects into only their leaf nodes (ie. "SR5.Ammo", "SR5.TestResults.AttackHits", etc.)
export type Translation = NestedKeys<typeof englishTranslations>;

// Utility type to help uncover untranslated strings.  Left commented out due to only being useful during development
// export type FullyTranslatedTranslation =
//     NestedKeys<typeof englishTranslations> &
//     NestedKeys<typeof germanTranslations> &
//     NestedKeys<typeof koreanTranslations> &
//     NestedKeys<typeof portTranslations> &
//     NestedKeys<typeof frenchTranslations>;

//Wrapped version of game.i18.format that only accepts Translation strings for data
export function formatStrict(stringId: Translation, data: Record<string, Translation>): string {
    return game.i18n.format(
        stringId,
        Object.fromEntries(Object.entries(data).map(([key, value]) => [key, game.i18n.localize(value)])),
    );
}
