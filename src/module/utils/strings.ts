import * as englishTranslations from "../../../public/locale/en/config.json";
import { NestedKeys } from './types';

// Type encompassing all translated strings, flattening nested objects into only their leaf nodes (ie. "SR5.AttackHits", "SR5.Tooltips.Actor.MissingSummoner", etc.)
export type Translation = NestedKeys<typeof englishTranslations>;
