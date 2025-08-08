// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Bioware {
    addtoparentess?: Empty;
    addweapon?: Empty | { _TEXT: string; };
    allowgear?: {
        gearcategory: Many<{ _TEXT: string; }>;
    };
    allowsubsystems?: {
        category: { _TEXT: string; };
    };
    avail: { _TEXT: string; };
    bannedgrades?: {
        grade: Many<{ _TEXT: string; }>;
    };
    blocksmounts?: { _TEXT: string; };
    bonus?: BonusSchema;
    capacity: { _TEXT: string; };
    category: { _TEXT: string; };
    cost: { _TEXT: string; };
    ess: { _TEXT: string; };
    forbidden?: ConditionsSchema;
    forcegrade?: { _TEXT: string; };
    hide?: Empty;
    id: { _TEXT: string; };
    isgeneware?: Empty;
    limit?: { _TEXT: string; };
    name: { _TEXT: string; };
    notes?: { _TEXT: string; };
    page: { _TEXT: string; };
    pairbonus?: {
        reach?: { _TEXT: string; $: { name: string; }; };
        unarmeddv?: { _TEXT: string; };
        unarmedreach?: { _TEXT: string; };
        walkmultiplier?: {
            category: { _TEXT: string; };
            val: { _TEXT: string; };
        };
    };
    pairinclude?: {
        name: { _TEXT: string; };
    };
    rating?: { _TEXT: string; };
    required?: ConditionsSchema;
    requireparent?: Empty;
    selectside?: Empty;
    source: { _TEXT: string; };
    translate?: { _TEXT: string; };
};

export interface Grade {
    avail: { _TEXT: string; };
    cost: { _TEXT: string; };
    devicerating: { _TEXT: string; };
    ess: { _TEXT: string; };
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    source: { _TEXT: string; };
    translate?: { _TEXT: string; };
};

export interface BiowareSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    biowares: {
        bioware: Many<Bioware>;
    };
    categories: {
        category: Many<{ _TEXT: string; $: { blackmarket: string; translate?: string; }; }>;
    };
    grades: {
        grade: Many<Grade>;
    };
};
