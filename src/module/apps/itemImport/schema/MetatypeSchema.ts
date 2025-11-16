// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface Metatype {
    addweapon?: { _TEXT: "Claws (Sasquatch)"; };
    agiaug: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F-1" | "F-2" | "F-3"; };
    agimax: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F-1" | "F-2" | "F-3"; };
    agimin: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F-1" | "F-2" | "F-3"; };
    armor?: { _TEXT: IntegerString | "(F x 2)H" | "12H" | "6H" | "F" | "F*2"; };
    biowares?: {
        bioware: Many<{ _TEXT: string; $?: { rating: IntegerString; }; }>;
    };
    bodaug: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F+7" | "F-1" | "F-2" | "F-3"; };
    bodmax: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F+7" | "F-1" | "F-2" | "F-3"; };
    bodmin: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F+7" | "F-1" | "F-2" | "F-3"; };
    bonus?: BonusSchema;
    category?: { _TEXT: string; };
    chaaug: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F-1" | "F-2"; };
    chamax: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F-1" | "F-2"; };
    chamin: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F-1" | "F-2"; };
    complexforms?: {
        complexform: OneOrMany<{ _TEXT: string; $?: { select: "Attack" | "Data Processing" | "Firewall" | "Sleaze"; }; }>;
    };
    depaug: { _TEXT: IntegerString; };
    depmax: { _TEXT: IntegerString; };
    depmin: { _TEXT: IntegerString; };
    edgaug: { _TEXT: IntegerString | "F" | "F/2"; };
    edgmax: { _TEXT: IntegerString | "F" | "F/2"; };
    edgmin: { _TEXT: IntegerString | "F" | "F/2"; };
    essaug: { _TEXT: IntegerString | "2D6" | "3D6" | "F" | "F-2"; };
    essmax: { _TEXT: IntegerString | "2D6" | "3D6" | "F" | "F-2"; };
    essmin: { _TEXT: IntegerString | "2D6" | "F" | "F-2"; };
    forcecreature?: Empty;
    forceislevels?: Empty;
    forms?: Empty;
    halveattributepoints?: Empty;
    id: { _TEXT: string; };
    iniaug: { _TEXT: IntegerString | string; };
    inimax: { _TEXT: IntegerString | string; };
    inimin: { _TEXT: IntegerString | string; };
    initiativedice?: { _TEXT: IntegerString; };
    intaug: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F-1" | "F-2"; };
    intmax: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F-1" | "F-2"; };
    intmin: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F-1" | "F-2"; };
    karma?: { _TEXT: IntegerString; };
    logaug: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F-1" | "F-2"; };
    logmax: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F-1" | "F-2"; };
    logmin: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F-1" | "F-2"; };
    magaug: { _TEXT: IntegerString | "F"; };
    magmax: { _TEXT: IntegerString | "F"; };
    magmin: { _TEXT: IntegerString | "F"; };
    metavariants?: {
        metavariant: OneOrMany<Metatype>;
    };
    movement?: { _TEXT: "Special"; };
    name: { _TEXT: string; };
    optionalpowers?: {
        optionalpower: OneOrMany<{ _TEXT: string; $?: { select: string; }; }>;
    };
    page?: { _TEXT: IntegerString; };
    powers?: {
        power: OneOrMany<{ _TEXT: string; $?: { rating?: IntegerString | "F"; select?: IntegerString | string; }; }>;
    };
    qualities?: {
        negative?: {
            quality: OneOrMany<{ _TEXT: string; $?: { removable?: "True"; select?: string; }; }>;
        };
        positive?: {
            quality: OneOrMany<{ _TEXT: string; $?: { removable?: "True"; select?: string; }; }>;
        };
    };
    qualityrestriction?: {
        negative: {
            quality: Many<{ _TEXT: string; }>;
        };
        positive: {
            quality: Many<{ _TEXT: string; }>;
        };
    };
    reaaug: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F-1" | "F-2"; };
    reamax: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F-1" | "F-2"; };
    reamin: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F-1" | "F-2"; };
    resaug: { _TEXT: IntegerString | "F"; };
    resmax: { _TEXT: IntegerString | "F"; };
    resmin: { _TEXT: IntegerString | "F"; };
    run?: { _TEXT: string; $?: { alt: "4/1/0"; }; };
    skills?: {
        group?: OneOrMany<{ _TEXT: "Athletics" | "Close Combat" | "Conjuring" | "Influence" | "Outdoors" | "Sorcery"; $: { rating: IntegerString | "F"; }; }>;
        knowledge?: { _TEXT: "Animal Calls"; $: { attribute: "LOG"; category: "Professional"; rating: IntegerString; }; };
        skill: Many<{ _TEXT: string; $: { rating: IntegerString | "F" | "F/2"; select?: "Noxious Breath" | "Thorns"; spec?: string; }; }>;
    };
    source?: { _TEXT: string; };
    sprint?: { _TEXT: string; $?: { alt: "1/1/0" | "2/1/0"; }; };
    straug: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F+6" | "F-1" | "F-2" | "F-3"; };
    strmax: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F+6" | "F-1" | "F-2" | "F-3"; };
    strmin: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+3" | "F+4" | "F+5" | "F+6" | "F-1" | "F-2" | "F-3"; };
    walk?: { _TEXT: string; $?: { alt: "2/1/0" | "4/1/0"; }; };
    wilaug: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+4" | "F-1" | "F-2"; };
    wilmax: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+4" | "F-1" | "F-2"; };
    wilmin: { _TEXT: IntegerString | "F" | "F+1" | "F+2" | "F+4" | "F-1" | "F-2"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface MetatypeSchema {
    $: { xmlns?: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema critters.xsd" | "http://www.w3.org/2001/XMLSchema metatypes.xsd"; };
    categories: {
        category: Many<{ _TEXT: string; $?: { translate: string; }; }>;
    };
    metatypes: {
        metatype: Many<Metatype>;
    };
};
