// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Many } from './Types';

export interface Complexform {
    bonus?: BonusSchema;
    duration: { _TEXT: string; };
    fv: { _TEXT: string; };
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    required?: ConditionsSchema;
    source: { _TEXT: string; };
    target: { _TEXT: string; };
};

export interface ComplexformsSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    complexforms: {
        complexform: Many<Complexform>;
    };
};
