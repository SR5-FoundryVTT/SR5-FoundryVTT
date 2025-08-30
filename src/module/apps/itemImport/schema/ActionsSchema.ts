// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface Action {
    boosts?: {
        boost: OneOrMany<{
            addlimit?: { _TEXT: "{Physical}" | "{Weapon: Accuracy}"; };
            dicebonus: { _TEXT: string; };
            duration: { _TEXT: "One Attack" | "Rest of Turn"; };
            name: { _TEXT: string; };
        }>;
    };
    category?: { _TEXT: "Matrix"; };
    edgecost?: { _TEXT: IntegerString; };
    id: { _TEXT: string; };
    initiativecost?: { _TEXT: IntegerString; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    requireunlock?: Empty;
    source?: { _TEXT: "DT" | "KC" | "R5" | "RG" | "SR5"; };
    specname?: { _TEXT: "Blocking" | "Data Bombs" | "Dodging" | "Parrying" | "Sprinting"; };
    test?: {
        bonusstring?: { _TEXT: string; };
        defenselimit?: { _TEXT: "{Max: {Physical} or {Mental}}" | "{Mental}"; };
        dice: { _TEXT: string; };
        limit?: { _TEXT: string; };
    };
    type: { _TEXT: "Complex" | "Extended" | "Free" | "Interrupt" | "No" | "Simple"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface ActionsSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema actions.xsd"; };
    actions: {
        action: Many<Action>;
    };
    version: { _TEXT: IntegerString; };
};
