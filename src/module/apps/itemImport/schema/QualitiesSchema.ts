// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface Quality {
    addweapon?: { _TEXT: string; };
    bonus?: BonusSchema;
    canbuywithspellpoints?: { _TEXT: "True"; };
    careeronly?: Empty;
    category: { _TEXT: "Negative" | "Positive"; };
    chargenlimit?: { _TEXT: IntegerString; };
    chargenonly?: Empty;
    contributetobp?: { _TEXT: "False"; };
    contributetolimit?: { _TEXT: "False"; };
    costdiscount?: {
        required: ConditionsSchema;
        value: { _TEXT: IntegerString; };
    };
    doublecareer?: { _TEXT: "False"; };
    firstlevelbonus?: {
        attributemaxclamp?: Many<{ _TEXT: "AGI" | "BOD" | "REA" | "STR"; }>;
        notoriety?: { _TEXT: IntegerString; };
    };
    forbidden?: ConditionsSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    implemented?: { _TEXT: "False"; };
    includeinlimit?: {
        name: OneOrMany<{ _TEXT: string; }>;
    };
    karma: { _TEXT: IntegerString; };
    limit?: { _TEXT: IntegerString | "False" | "{arm} - 1"; };
    limitwithinclusions?: { _TEXT: IntegerString; };
    metagenic?: { _TEXT: "True"; };
    mutant?: { _TEXT: "True"; };
    name: { _TEXT: string; };
    nameonpage?: { _TEXT: "Adepts" | "Aspected Magicians" | "Magicians" | "Mystic Adepts" | "Special Modifications"; };
    naturalweapons?: {
        naturalweapon: OneOrMany<{
            accuracy: { _TEXT: "Physical"; };
            ap: { _TEXT: IntegerString; };
            damage: { _TEXT: "({STR}+1)P" | "({STR}+2)P" | "({STR}+3)P"; };
            name: { _TEXT: string; };
            page?: { _TEXT: IntegerString; };
            reach: { _TEXT: IntegerString; };
            source?: { _TEXT: "FA" | "HS" | "RF"; };
            useskill: { _TEXT: "Throwing Weapons" | "Unarmed Combat"; };
        }>;
    };
    nolevels?: Empty;
    onlyprioritygiven?: Empty;
    page?: { _TEXT: IntegerString; };
    refundkarmaonremove?: Empty;
    required?: ConditionsSchema;
    source?: { _TEXT: string; };
    stagedpurchase?: { _TEXT: "True"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface QualitiesSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema qualities.xsd"; };
    categories: {
        category: Many<{ _TEXT: "Negative" | "Positive"; $?: { translate: string; }; }>;
    };
    qualities: {
        quality: Many<Quality>;
    };
};
