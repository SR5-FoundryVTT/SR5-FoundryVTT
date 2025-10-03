// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, IntegerString } from './Types';

export interface Enhancement {
    bonus?: BonusSchema;
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    power: Empty | { _TEXT: string; };
    required: ConditionsSchema;
    source?: { _TEXT: "SG"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface Power {
    action?: { _TEXT: "Complex" | "Free" | "Interrupt" | "Simple" | "Special"; };
    adeptway?: { _TEXT: IntegerString; };
    adeptwayrequires?: {
        magicianswayforbids?: Empty;
        required?: ConditionsSchema;
    };
    bonus?: BonusSchema;
    doublecost?: { _TEXT: "False"; };
    extrapointcost?: { _TEXT: IntegerString; };
    forbidden?: ConditionsSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    includeinlimit?: {
        name: { _TEXT: "Power Swimming" | "Power Swimming (Elf or Troll)"; };
    };
    levels: { _TEXT: "False" | "True"; };
    limit: { _TEXT: IntegerString; };
    maxlevels?: { _TEXT: IntegerString; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    points: { _TEXT: IntegerString; };
    required?: ConditionsSchema;
    source?: { _TEXT: "BB" | "BLB" | "BTB" | "CA" | "FA" | "HT" | "SG" | "SGE" | "SR5" | "SS" | "SSP"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface PowersSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema powers.xsd"; };
    enhancements: {
        enhancement: Many<Enhancement>;
    };
    powers: {
        power: Many<Power>;
    };
};
