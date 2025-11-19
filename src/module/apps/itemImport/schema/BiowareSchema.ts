// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, IntegerString } from './Types';

export interface Bioware {
    addtoparentess?: Empty;
    addweapon?: Empty | { _TEXT: string; };
    allowgear?: {
        gearcategory: Many<{ _TEXT: "Chemicals" | "Custom" | "Custom Drug" | "Drugs" | "Toxins"; }>;
    };
    allowsubsystems?: {
        category: { _TEXT: "Chemical Gland Modifications"; };
    };
    avail: { _TEXT: IntegerString | string; };
    bannedgrades?: {
        grade: Many<{ _TEXT: "Alphaware" | "Omegaware" | "Standard" | "Standard (Burnout's Way)" | "Used" | "Used (Adapsin)"; }>;
    };
    blocksmounts?: { _TEXT: "ankle,knee,hip" | "wrist,elbow,shoulder"; };
    bonus?: BonusSchema;
    capacity: { _TEXT: IntegerString; };
    category: { _TEXT: string; };
    cost: { _TEXT: IntegerString | string; };
    ess: { _TEXT: IntegerString | string; };
    forbidden?: ConditionsSchema;
    forcegrade?: { _TEXT: "None"; };
    hide?: Empty;
    id: { _TEXT: string; };
    isgeneware?: Empty;
    limit?: { _TEXT: IntegerString | "False" | "{BODUnaug}" | "{arm}" | "{leg}"; };
    name: { _TEXT: string; };
    notes?: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    pairbonus?: {
        reach?: { _TEXT: IntegerString; $: { name: "Claws (Bio-Weapon)" | "Retractable Claws (Bio-Weapon)"; }; };
        unarmeddv?: { _TEXT: IntegerString; };
        unarmedreach?: { _TEXT: IntegerString; };
        walkmultiplier?: {
            category: { _TEXT: "Swim"; };
            val: { _TEXT: IntegerString; };
        };
    };
    pairinclude?: {
        name: { _TEXT: "Striking Callus (Feet)" | "Striking Callus (Hands)"; };
    };
    rating?: { _TEXT: IntegerString; };
    required?: ConditionsSchema;
    requireparent?: Empty;
    selectside?: Empty;
    source?: { _TEXT: IntegerString | "CF" | "DTR" | "HT" | "KC" | "NF" | "SR5"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface Grade {
    avail: { _TEXT: IntegerString; };
    cost: { _TEXT: IntegerString; };
    devicerating: { _TEXT: IntegerString; };
    ess: { _TEXT: IntegerString; };
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    source?: { _TEXT: "CF" | "SG" | "SR5"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface BiowareSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema bioware.xsd"; };
    biowares: {
        bioware: Many<Bioware>;
    };
    categories: {
        category: Many<{ _TEXT: string; $: { blackmarket: "Bioware" | "Geneware"; translate?: string; }; }>;
    };
    grades: {
        grade: Many<Grade>;
    };
};
