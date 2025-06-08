// AUTO‑GENERATED — DO NOT EDIT

import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Accessory {
    accessorycostmultiplier?: { _TEXT: string; };
    accuracy?: { _TEXT: string; };
    addunderbarrels?: {
        weapon: { _TEXT: string; };
    };
    allowgear?: {
        gearcategory: Many<{ _TEXT: string; }>;
    };
    ammobonus?: { _TEXT: string; };
    ammoreplace?: { _TEXT: string; };
    ammoslots?: { _TEXT: string; };
    ap?: { _TEXT: string; };
    avail: { _TEXT: string; };
    conceal?: { _TEXT: string; };
    cost: { _TEXT: string; };
    damage?: { _TEXT: string; };
    damagetype?: { _TEXT: string; };
    extramount?: { _TEXT: string; };
    forbidden?: ConditionsSchema;
    gears?: {
        usegear: OneOrMany<{
            category: { _TEXT: string; };
            name: { _TEXT: string; };
        }>;
    };
    hide?: Empty;
    id: { _TEXT: string; };
    modifyammocapacity?: { _TEXT: string; };
    mount: Empty | { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    rangemodifier?: { _TEXT: string; };
    rating: { _TEXT: string; };
    rc?: { _TEXT: string; };
    rcdeployable?: { _TEXT: string; };
    rcgroup?: { _TEXT: string; };
    reach?: { _TEXT: string; };
    required?: ConditionsSchema;
    source: { _TEXT: string; };
    specialmodification?: { _TEXT: string; };
};

export interface Weapon {
    accessories?: {
        accessory: OneOrMany<{
            gears?: {
                usegear: OneOrMany<{
                    category: { _TEXT: string; };
                    name: { _TEXT: string; $?: { select: string; }; };
                    rating?: { _TEXT: string; };
                }>;
            };
            mount?: { _TEXT: string; };
            name: { _TEXT: string; };
            rating?: { _TEXT: string; };
        }>;
    };
    accessorymounts?: {
        mount: OneOrMany<{ _TEXT: string; }>;
    };
    accuracy: { _TEXT: string; };
    addweapon?: OneOrMany<{ _TEXT: string; }>;
    allowaccessory?: { _TEXT: string; };
    allowgear?: {
        gearcategory: Many<{ _TEXT: string; }>;
    };
    alternaterange?: { _TEXT: string; };
    ammo: { _TEXT: string; };
    ammocategory?: { _TEXT: string; };
    ammoslots?: { _TEXT: string; };
    ap: { _TEXT: string; };
    avail: { _TEXT: string; };
    category: { _TEXT: string; };
    conceal: { _TEXT: string; };
    cost: { _TEXT: string; };
    cyberware?: { _TEXT: string; };
    damage: { _TEXT: string; };
    doubledcostaccessorymounts?: {
        mount: { _TEXT: string; };
    };
    extramount?: { _TEXT: string; };
    hide?: Empty;
    id: { _TEXT: string; };
    maxrating?: { _TEXT: string; };
    mode: { _TEXT: string; };
    mount?: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    range?: { _TEXT: string; };
    rc: { _TEXT: string; };
    reach: { _TEXT: string; };
    requireammo?: { _TEXT: string; };
    required?: ConditionsSchema;
    shortburst?: { _TEXT: string; };
    singleshot?: { _TEXT: string; };
    sizecategory?: { _TEXT: string; };
    source: { _TEXT: string; };
    spec?: { _TEXT: string; };
    spec2?: { _TEXT: string; };
    type: { _TEXT: string; };
    underbarrels?: {
        underbarrel: OneOrMany<{ _TEXT: string; }>;
    };
    useskill?: { _TEXT: string; };
    useskillspec?: { _TEXT: string; };
    weapontype?: { _TEXT: string; };
};

export interface WeaponsSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    accessories: {
        accessory: Many<Accessory>;
    };
    categories: {
        category: Many<{ _TEXT: string; $: { blackmarket: string; gunneryspec?: string; type: string; }; }>;
    };
    weapons: {
        weapon: Many<Weapon>;
    };
};
