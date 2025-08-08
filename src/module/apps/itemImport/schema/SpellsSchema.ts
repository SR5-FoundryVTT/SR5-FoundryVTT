// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Spell {
    bonus?: BonusSchema;
    category: { _TEXT: string; };
    damage: { _TEXT: string; };
    descriptor: Empty | { _TEXT: string; };
    duration: { _TEXT: string; };
    dv: { _TEXT: string; };
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    range: { _TEXT: string; };
    required?: ConditionsSchema;
    source: { _TEXT: string; };
    type: { _TEXT: string; };
    useskill?: { _TEXT: string; };
    translate?: string;
};

export interface SpellsSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    categories: {
        category: Many<{ _TEXT: string; $: { alchemicalskill?: string; barehandedadeptskill?: string; translate?: string; useskill: string; }; }>;
    };
    spells: {
        spell: Many<Spell>;
    };
};
