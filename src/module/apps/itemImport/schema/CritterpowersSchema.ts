// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Power {
    action: Empty | { _TEXT: string; };
    bonus?: BonusSchema;
    category: { _TEXT: string; };
    duration: Empty | { _TEXT: string; };
    forbidden?: ConditionsSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    karma?: Empty | { _TEXT: string; };
    name: { _TEXT: string; };
    notes?: { _TEXT: string; };
    page: { _TEXT: string; };
    range: Empty | { _TEXT: string; };
    rating?: { _TEXT: string; };
    required?: ConditionsSchema;
    source: { _TEXT: string; };
    toxic?: { _TEXT: string; };
    type: Empty | { _TEXT: string; };
    translate?: string;
};

export interface CritterpowersSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    categories: {
        category: Many<{ _TEXT: string; $?: { translate?: string; whitelist: string; }; }>;
    };
    powers: {
        power: Many<Power>;
    };
};
