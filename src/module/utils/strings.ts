import * as englishTranslations from "../../../public/locale/en/config.json";
import { NestedKeys } from './types';

// Type encompassing all translated strings, flattening nested objects into only their leaf nodes (ie. "SR5.Ammo", "SR5.TestResults.AttackHits", etc.)
export type Translation = NestedKeys<typeof englishTranslations>;
