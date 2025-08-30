// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Many, IntegerString } from './Types';

export interface Complexform {
    bonus?: BonusSchema;
    duration: { _TEXT: "E" | "I" | "P" | "S" | "Special"; };
    fv: { _TEXT: "L" | "L+0" | "L+1" | "L+2" | "L+3" | "L+6" | "L-1" | "L-2" | "L-3" | "Special"; };
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    required?: ConditionsSchema;
    source?: { _TEXT: "CF" | "DT" | "KC" | "SR5"; };
    target: { _TEXT: string; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface ComplexformsSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema complexforms.xsd"; };
    complexforms: {
        complexform: Many<Complexform>;
    };
};
