// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Power {
    action: { _TEXT: string; };
    bonus?: BonusSchema;
    category: { _TEXT: string; };
    duration: { _TEXT: string; };
    forbidden?: ConditionsSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    karma?: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    range: { _TEXT: string; };
    rating?: { _TEXT: string; };
    required?: ConditionsSchema;
    source: { _TEXT: string; };
    toxic?: { _TEXT: string; };
    type: { _TEXT: string; };
};

export interface CritterpowersSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    categories: {
        category: Many<{ _TEXT: string; $?: { whitelist: string; }; }>;
    };
    powers: {
        power: Many<Power>;
    };
};
