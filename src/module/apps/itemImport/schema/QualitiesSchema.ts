// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Quality {
    addweapon?: { _TEXT: string; };
    bonus?: BonusSchema;
    canbuywithspellpoints?: { _TEXT: string; };
    careeronly?: Empty;
    category: { _TEXT: string; };
    chargenlimit?: { _TEXT: string; };
    chargenonly?: Empty;
    contributetobp?: { _TEXT: string; };
    contributetolimit?: { _TEXT: string; };
    costdiscount?: {
        required: ConditionsSchema;
        value: { _TEXT: string; };
    };
    doublecareer?: { _TEXT: string; };
    firstlevelbonus?: {
        attributemaxclamp?: Many<{ _TEXT: string; }>;
        notoriety?: { _TEXT: string; };
    };
    forbidden?: ConditionsSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    implemented?: { _TEXT: string; };
    includeinlimit?: {
        name: OneOrMany<{ _TEXT: string; }>;
    };
    karma: { _TEXT: string; };
    limit?: { _TEXT: string; };
    limitwithinclusions?: { _TEXT: string; };
    metagenic?: { _TEXT: string; };
    mutant?: { _TEXT: string; };
    name: { _TEXT: string; };
    nameonpage?: { _TEXT: string; };
    naturalweapons?: {
        naturalweapon: OneOrMany<{
            accuracy: { _TEXT: string; };
            ap: { _TEXT: string; };
            damage: { _TEXT: string; };
            name: { _TEXT: string; };
            page: { _TEXT: string; };
            reach: { _TEXT: string; };
            source: { _TEXT: string; };
            useskill: { _TEXT: string; };
        }>;
    };
    nolevels?: Empty;
    onlyprioritygiven?: Empty;
    page: { _TEXT: string; };
    refundkarmaonremove?: Empty;
    required?: ConditionsSchema;
    source: { _TEXT: string; };
    stagedpurchase?: { _TEXT: string; };
    translate?: { _TEXT: string; };
};

export interface QualitiesSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    categories: {
        category: Many<{ _TEXT: string; $?: { translate: string; }; }>;
    };
    qualities: {
        quality: Many<Quality>;
    };
};
