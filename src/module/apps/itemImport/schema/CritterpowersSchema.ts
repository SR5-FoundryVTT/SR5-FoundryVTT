// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, IntegerString } from './Types';

export interface Power {
    action: Empty | { _TEXT: "As ritual" | "Auto" | "Complex" | "Free" | "None" | "Simple" | "Special"; };
    bonus?: BonusSchema;
    category: { _TEXT: string; };
    duration: Empty | { _TEXT: string; };
    forbidden?: ConditionsSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    karma?: Empty | { _TEXT: IntegerString; };
    name: { _TEXT: string; };
    notes?: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    range: Empty | { _TEXT: string; };
    rating?: { _TEXT: IntegerString | "True"; };
    required?: ConditionsSchema;
    source?: { _TEXT: "AET" | "DTR" | "FA" | "HS" | "KC" | "RF" | "SG" | "SR5"; };
    toxic?: { _TEXT: "True"; };
    type: Empty | { _TEXT: string; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface CritterpowersSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema critterpowers.xsd"; };
    categories: {
        category: Many<{ _TEXT: string; $?: { translate?: string; whitelist: "true"; }; }>;
    };
    powers: {
        power: Many<Power>;
    };
};
