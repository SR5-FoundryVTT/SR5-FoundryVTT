// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Armor {
    addmodcategory?: { _TEXT: string; };
    addweapon?: { _TEXT: string; };
    armor: { _TEXT: string; };
    armorcapacity: { _TEXT: string; };
    armoroverride?: { _TEXT: string; };
    avail: { _TEXT: string; };
    bonus?: BonusSchema;
    category: { _TEXT: string; };
    cost: { _TEXT: string; };
    gears?: {
        usegear: OneOrMany<{
            $?: { rating: string; };
            capacity?: { _TEXT: string; };
            category?: { _TEXT: string; };
            name?: { _TEXT: string; };
            rating?: { _TEXT: string; };
            _TEXT?: string;
        }>;
    };
    id: { _TEXT: string; };
    mods?: {
        name: OneOrMany<{ _TEXT: string; $?: { maxrating?: string; rating: string; }; }>;
    };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    rating?: { _TEXT: string; };
    selectmodsfromcategory?: {
        category: { _TEXT: string; };
    };
    source: { _TEXT: string; };
    wirelessbonus?: {
        limitmodifier?: {
            condition: { _TEXT: string; };
            limit: { _TEXT: string; };
            value: { _TEXT: string; };
        };
        skillcategory?: {
            bonus: { _TEXT: string; };
            name: { _TEXT: string; };
        };
        specificskill?: {
            bonus: { _TEXT: string; };
            name: { _TEXT: string; };
        };
    };
    translate?: { _TEXT: string; };
};

export interface Mod {
    addoncategory?: Many<{ _TEXT: string; }>;
    armor: { _TEXT: string; };
    armorcapacity: { _TEXT: string; };
    avail: { _TEXT: string; };
    bonus?: BonusSchema;
    category: { _TEXT: string; };
    cost: { _TEXT: string; };
    gearcapacity?: { _TEXT: string; };
    hide?: Empty;
    id: { _TEXT: string; };
    maxrating: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    required?: ConditionsSchema;
    source: { _TEXT: string; };
    wirelessbonus?: {
        limitmodifier: {
            condition: { _TEXT: string; };
            limit: { _TEXT: string; };
            value: { _TEXT: string; };
        };
    };
    translate?: { _TEXT: string; };
};

export interface ArmorSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    armors: {
        armor: Many<Armor>;
    };
    categories: {
        category: Many<{ _TEXT: string; $: { blackmarket: string; translate?: string; }; }>;
    };
    modcategories: {
        category: Many<{ _TEXT: string; $: { blackmarket: string; translate?: string; }; }>;
    };
    mods: {
        mod: Many<Mod>;
    };
};
