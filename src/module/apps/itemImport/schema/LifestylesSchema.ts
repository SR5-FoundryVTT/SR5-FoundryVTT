// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface City {
    district: OneOrMany<{
        borough?: OneOrMany<{
            name: Empty | { _TEXT: string; };
            secRating?: { _TEXT: "A" | "A/B" | "AA" | "AAA" | "B" | "B/C" | "C" | "D" | "E" | "Z"; };
        }>;
        name: Empty | { _TEXT: string; };
    }>;
    name: Empty | { _TEXT: string; };
    translate?: OneOrMany<{ _TEXT: string; }>;
    altpage?: OneOrMany<{ _TEXT: string; }>;
    altnameonpage?: OneOrMany<Empty>;
};

export interface Comfort {
    limit: { _TEXT: IntegerString; };
    minimum: { _TEXT: IntegerString; };
    name: { _TEXT: string; };
    translate?: OneOrMany<{ _TEXT: string; }>;
    altpage?: OneOrMany<{ _TEXT: string; }>;
    altnameonpage?: OneOrMany<Empty>;
};

export interface Lifestyle {
    allowbonuslp?: { _TEXT: "True"; };
    cost: { _TEXT: IntegerString; };
    costforarea?: { _TEXT: IntegerString; };
    costforcomforts?: { _TEXT: IntegerString; };
    costforsecurity?: { _TEXT: IntegerString; };
    dice: { _TEXT: IntegerString; };
    freegrids?: {
        freegrid: OneOrMany<{ _TEXT: "Grid Subscription"; $: { select: "Global Grid" | "Local Grid" | "Public Grid"; }; }>;
    };
    hide?: Empty;
    id: { _TEXT: string; };
    increment?: { _TEXT: "day"; };
    lp: { _TEXT: IntegerString; };
    multiplier: { _TEXT: IntegerString; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    source?: { _TEXT: "RF" | "SR5"; };
    translate?: OneOrMany<{ _TEXT: string; }>;
    altpage?: OneOrMany<{ _TEXT: string; }>;
    altnameonpage?: OneOrMany<Empty>;
};

export interface Neighborhood {
    limit: { _TEXT: IntegerString; };
    minimum: { _TEXT: IntegerString; };
    name: { _TEXT: string; };
    translate?: OneOrMany<{ _TEXT: string; }>;
    altpage?: OneOrMany<{ _TEXT: string; }>;
    altnameonpage?: OneOrMany<Empty>;
};

export interface Quality {
    allowed?: { _TEXT: string; };
    allowmultiple?: Empty;
    area?: { _TEXT: IntegerString; };
    bonus?: BonusSchema;
    category: { _TEXT: string; };
    comforts?: { _TEXT: IntegerString; };
    comfortsmaximum?: { _TEXT: IntegerString; };
    comfortsminimum?: { _TEXT: IntegerString; };
    cost?: { _TEXT: IntegerString | "100000 div 12" | "25000 div 12" | "5000 div 12" | "50000 div 12"; };
    forbidden?: ConditionsSchema;
    id: { _TEXT: string; };
    lp: { _TEXT: IntegerString; };
    multiplier?: { _TEXT: IntegerString; };
    multiplierbaseonly?: { _TEXT: IntegerString; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    required?: ConditionsSchema;
    security?: { _TEXT: IntegerString; };
    securityminimum?: { _TEXT: IntegerString; };
    source?: { _TEXT: "CA" | "CF" | "HT" | "RF" | "SFB" | "SFCR" | "SR5"; };
    translate?: OneOrMany<{ _TEXT: string; }>;
    altpage?: OneOrMany<{ _TEXT: string; }>;
    altnameonpage?: OneOrMany<Empty>;
};

export interface Security {
    limit: { _TEXT: IntegerString; };
    minimum: { _TEXT: IntegerString; };
    name: { _TEXT: string; };
    translate?: OneOrMany<{ _TEXT: string; }>;
    altpage?: OneOrMany<{ _TEXT: string; }>;
    altnameonpage?: OneOrMany<Empty>;
};

export interface LifestylesSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema lifestyles.xsd"; };
    categories: {
        category: Many<{ _TEXT: string; $?: { translate: string; }; }>;
    };
    cities: {
        city: Many<City>;
    };
    comforts: {
        comfort: Many<Comfort>;
    };
    lifestyles: {
        lifestyle: Many<Lifestyle>;
    };
    neighborhoods: {
        neighborhood: Many<Neighborhood>;
    };
    qualities: {
        quality: Many<Quality>;
    };
    securities: {
        security: Many<Security>;
    };
};
