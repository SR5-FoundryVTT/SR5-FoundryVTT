// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Metatype {
    addweapon?: { _TEXT: string; };
    agiaug: { _TEXT: string; };
    agimax: { _TEXT: string; };
    agimin: { _TEXT: string; };
    armor?: { _TEXT: string; };
    biowares?: {
        bioware: Many<{ _TEXT: string; $?: { rating: string; }; }>;
    };
    bodaug: { _TEXT: string; };
    bodmax: { _TEXT: string; };
    bodmin: { _TEXT: string; };
    bonus?: BonusSchema;
    category?: { _TEXT: string; };
    chaaug: { _TEXT: string; };
    chamax: { _TEXT: string; };
    chamin: { _TEXT: string; };
    complexforms?: {
        complexform: OneOrMany<{ _TEXT: string; $?: { select: string; }; }>;
    };
    depaug: { _TEXT: string; };
    depmax: { _TEXT: string; };
    depmin: { _TEXT: string; };
    edgaug: { _TEXT: string; };
    edgmax: { _TEXT: string; };
    edgmin: { _TEXT: string; };
    essaug: { _TEXT: string; };
    essmax: { _TEXT: string; };
    essmin: { _TEXT: string; };
    forcecreature?: Empty;
    forceislevels?: Empty;
    forms?: Empty;
    halveattributepoints?: Empty;
    id: { _TEXT: string; };
    iniaug: { _TEXT: string; };
    inimax: { _TEXT: string; };
    inimin: { _TEXT: string; };
    initiativedice?: { _TEXT: string; };
    intaug: { _TEXT: string; };
    intmax: { _TEXT: string; };
    intmin: { _TEXT: string; };
    karma?: { _TEXT: string; };
    logaug: { _TEXT: string; };
    logmax: { _TEXT: string; };
    logmin: { _TEXT: string; };
    magaug: { _TEXT: string; };
    magmax: { _TEXT: string; };
    magmin: { _TEXT: string; };
    metavariants?: {
        metavariant: OneOrMany<Metatype>;
    };
    movement?: { _TEXT: string; };
    name: { _TEXT: string; };
    optionalpowers?: {
        optionalpower: OneOrMany<{ _TEXT: string; $?: { select: string; }; }>;
    };
    page: { _TEXT: string; };
    powers?: {
        power: OneOrMany<{ _TEXT: string; $?: { rating?: string; select?: string; }; }>;
    };
    qualities?: {
        negative?: {
            quality: OneOrMany<{ _TEXT: string; $?: { removable?: string; select?: string; }; }>;
        };
        positive?: {
            quality: OneOrMany<{ _TEXT: string; $?: { removable?: string; select?: string; }; }>;
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
    reaaug: { _TEXT: string; };
    reamax: { _TEXT: string; };
    reamin: { _TEXT: string; };
    resaug: { _TEXT: string; };
    resmax: { _TEXT: string; };
    resmin: { _TEXT: string; };
    run?: { _TEXT: string; $?: { alt: string; }; };
    skills?: {
        group?: OneOrMany<{ _TEXT: string; $: { rating: string; }; }>;
        knowledge?: { _TEXT: string; $: { attribute: string; category: string; rating: string; }; };
        skill: Many<{ _TEXT: string; $: { rating: string; select?: string; spec?: string; }; }>;
    };
    source: { _TEXT: string; };
    sprint?: { _TEXT: string; $?: { alt: string; }; };
    straug: { _TEXT: string; };
    strmax: { _TEXT: string; };
    strmin: { _TEXT: string; };
    walk?: { _TEXT: string; $?: { alt: string; }; };
    wilaug: { _TEXT: string; };
    wilmax: { _TEXT: string; };
    wilmin: { _TEXT: string; };
};

export interface MetatypeSchema {
    $: { xmlns?: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    categories: {
        category: Many<{ _TEXT: string; }>;
    };
    metatypes: {
        metatype: Many<Metatype>;
    };
};
