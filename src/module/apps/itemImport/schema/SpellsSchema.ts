// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, IntegerString } from './Types';

export interface Spell {
    bonus?: BonusSchema;
    category: { _TEXT: "Combat" | "Detection" | "Enchantments" | "Health" | "Illusion" | "Manipulation" | "Rituals"; };
    damage: { _TEXT: IntegerString | "P" | "S" | "Special"; };
    descriptor: Empty | { _TEXT: string; };
    duration: { _TEXT: "I" | "P" | "S" | "Special"; };
    dv: { _TEXT: IntegerString | string; };
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    range: { _TEXT: "LOS" | "LOS (A)" | "S" | "S (A)" | "Special" | "T" | "T (A)"; };
    required?: ConditionsSchema;
    source?: { _TEXT: "BB" | "BTB" | "CA" | "FA" | "HT" | "PGG" | "SFCR" | "SG" | "SR5" | "SS" | "SSP"; };
    type: { _TEXT: "M" | "P"; };
    useskill?: { _TEXT: "Animal Handling"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface SpellsSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema spells.xsd"; };
    categories: {
        category: Many<{ _TEXT: "Combat" | "Detection" | "Enchantments" | "Health" | "Illusion" | "Manipulation" | "Rituals"; $: { alchemicalskill?: "Alchemy"; barehandedadeptskill?: "Unarmed Combat"; translate?: string; useskill: "Artificing" | "Ritual Spellcasting" | "Spellcasting"; }; }>;
    };
    spells: {
        spell: Many<Spell>;
    };
};
