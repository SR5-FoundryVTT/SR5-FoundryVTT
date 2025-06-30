// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many } from './Types';

export interface Enhancement {
    bonus?: BonusSchema;
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    power: Empty | { _TEXT: string; };
    required: ConditionsSchema;
    source: { _TEXT: string; };
};

export interface Power {
    action?: { _TEXT: string; };
    adeptway?: { _TEXT: string; };
    adeptwayrequires?: {
        magicianswayforbids?: Empty;
        required?: ConditionsSchema;
    };
    bonus?: BonusSchema;
    doublecost?: { _TEXT: string; };
    extrapointcost?: { _TEXT: string; };
    forbidden?: ConditionsSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    includeinlimit?: {
        name: { _TEXT: string; };
    };
    levels: { _TEXT: string; };
    limit: { _TEXT: string; };
    maxlevels?: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    points: { _TEXT: string; };
    required?: ConditionsSchema;
    source: { _TEXT: string; };
};

export interface PowersSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    enhancements: {
        enhancement: Many<Enhancement>;
    };
    powers: {
        power: Many<Power>;
    };
};
