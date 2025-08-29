// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Action {
    boosts?: {
        boost: OneOrMany<{
            addlimit?: { _TEXT: string; };
            dicebonus: { _TEXT: string; };
            duration: { _TEXT: string; };
            name: { _TEXT: string; };
        }>;
    };
    category?: { _TEXT: string; };
    edgecost?: { _TEXT: string; };
    id: { _TEXT: string; };
    initiativecost?: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    requireunlock?: Empty;
    source: { _TEXT: string; };
    specname?: { _TEXT: string; };
    test?: {
        bonusstring?: { _TEXT: string; };
        defenselimit?: { _TEXT: string; };
        dice: { _TEXT: string; };
        limit?: { _TEXT: string; };
    };
    type: { _TEXT: string; };
    translate?: { _TEXT: string; };
};

export interface ActionsSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    actions: {
        action: Many<Action>;
    };
    version: { _TEXT: string; };
};
