// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface Armor {
    addmodcategory?: { _TEXT: string; };
    addweapon?: { _TEXT: string; };
    armor: { _TEXT: IntegerString | "Rating"; };
    armorcapacity: { _TEXT: IntegerString | "Rating"; };
    armoroverride?: { _TEXT: IntegerString; };
    avail: { _TEXT: IntegerString | string; };
    bonus?: BonusSchema;
    category: { _TEXT: string; };
    cost: { _TEXT: IntegerString | string; };
    gears?: {
        usegear: OneOrMany<{
            $?: { rating: IntegerString; };
            capacity?: { _TEXT: "2/[0]"; };
            category?: { _TEXT: "Audio Devices" | "Vision Devices"; };
            name?: { _TEXT: "Camera" | "Microphone, Omni-Directional"; };
            rating?: { _TEXT: IntegerString; };
            _TEXT?: string;
        }>;
    };
    id: { _TEXT: string; };
    mods?: {
        name: OneOrMany<{ _TEXT: string; $?: { maxrating?: IntegerString; rating: IntegerString; }; }>;
    };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    rating?: { _TEXT: IntegerString; };
    selectmodsfromcategory?: {
        category: { _TEXT: string; };
    };
    source?: { _TEXT: IntegerString | string; };
    wirelessbonus?: {
        limitmodifier?: {
            condition: { _TEXT: string; };
            limit: { _TEXT: "Physical" | "Social"; };
            value: { _TEXT: IntegerString; };
        };
        skillcategory?: {
            bonus: { _TEXT: IntegerString; };
            name: { _TEXT: "Social" | "Social Active"; };
        };
        specificskill?: {
            bonus: { _TEXT: IntegerString; };
            name: { _TEXT: "Survival"; };
        };
    };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface Mod {
    addoncategory?: Many<{ _TEXT: "Commlinks" | "Cyberdecks" | "Drugs" | "Rigger Command Consoles" | "Toxins"; }>;
    armor: { _TEXT: IntegerString; };
    armorcapacity: { _TEXT: string; };
    avail: { _TEXT: IntegerString | string; };
    bonus?: BonusSchema;
    category: { _TEXT: string; };
    cost: { _TEXT: IntegerString | string; };
    gearcapacity?: { _TEXT: IntegerString; };
    hide?: Empty;
    id: { _TEXT: string; };
    maxrating: { _TEXT: IntegerString; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    required?: ConditionsSchema;
    source?: { _TEXT: "BB" | "BTB" | "CA" | "HAMG" | "HT" | "KC" | "RG" | "SL" | "SR5"; };
    wirelessbonus?: {
        limitmodifier: {
            condition: { _TEXT: "LimitCondition_SkillsActivePerception"; };
            limit: { _TEXT: "Mental"; };
            value: { _TEXT: IntegerString; };
        };
    };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface ArmorSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema armor.xsd"; };
    armors: {
        armor: Many<Armor>;
    };
    categories: {
        category: Many<{ _TEXT: string; $: { blackmarket: "Armor"; translate?: string; }; }>;
    };
    modcategories: {
        category: Many<{ _TEXT: string; $: { blackmarket: "Armor" | "Armor,Electronics,Magic,Software"; translate?: string; }; }>;
    };
    mods: {
        mod: Many<Mod>;
    };
};
