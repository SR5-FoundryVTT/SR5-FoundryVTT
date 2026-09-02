import actorsTranslations from '../../locale/en/actors.json';
import applicationsTranslations from '../../locale/en/applications.json';
import combatTranslations from '../../locale/en/combat.json';
import commonTranslations from '../../locale/en/common.json';
import effectsTranslations from '../../locale/en/effects.json';
import itemsTranslations from '../../locale/en/items.json';
import magicTranslations from '../../locale/en/magic.json';
import matrixTranslations from '../../locale/en/matrix.json';
import messagesTranslations from '../../locale/en/messages.json';
import testsTranslations from '../../locale/en/tests.json';
import systemTranslations from '../../locale/en/system.json';
import uiTranslations from '../../locale/en/ui.json';
import { NestedKeys } from './types';

// Type encompassing all translated strings, flattening nested objects into only their leaf nodes (ie. "SR5.Ammo", "SR5.TestResults.AttackHits", etc.)
export type Translation =
    | NestedKeys<typeof actorsTranslations>
    | NestedKeys<typeof applicationsTranslations>
    | NestedKeys<typeof combatTranslations>
    | NestedKeys<typeof commonTranslations>
    | NestedKeys<typeof effectsTranslations>
    | NestedKeys<typeof itemsTranslations>
    | NestedKeys<typeof magicTranslations>
    | NestedKeys<typeof matrixTranslations>
    | NestedKeys<typeof messagesTranslations>
    | NestedKeys<typeof testsTranslations>
    | NestedKeys<typeof systemTranslations>
    | NestedKeys<typeof uiTranslations>;

//Wrapped version of game.i18.format that only accepts Translation strings for data
export function formatStrict(stringId: Translation, data: Record<string, Translation>): string {
    return game.i18n.format(
        stringId,
        Object.fromEntries(Object.entries(data).map(([key, value]) => [key, game.i18n.localize(value)])),
    );
}
