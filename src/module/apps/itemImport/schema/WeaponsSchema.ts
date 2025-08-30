// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface Accessory {
    accessorycostmultiplier?: { _TEXT: IntegerString; };
    accuracy?: { _TEXT: IntegerString; };
    addmount?: { _TEXT: "Under"; };
    addunderbarrels?: {
        weapon: { _TEXT: "Krime Stun-O-Net" | "Underbarrel Shotgun"; };
    };
    allowgear?: {
        gearcategory: Many<{ _TEXT: "Autosofts" | "Commlinks" | "Custom" | "Vision Enhancements"; }>;
    };
    ammobonus?: { _TEXT: IntegerString | "50 * Rating"; };
    ammoreplace?: { _TEXT: IntegerString | "100(belt)" | "24(d)" | "2500(belt)" | "32(d)" | "40(c)" | "External Source"; };
    ammoslots?: { _TEXT: IntegerString; };
    ap?: { _TEXT: IntegerString; };
    avail: { _TEXT: IntegerString | string; };
    conceal?: { _TEXT: IntegerString | "Rating"; };
    cost: { _TEXT: IntegerString | string; };
    damage?: { _TEXT: IntegerString; };
    damagetype?: { _TEXT: "P"; };
    extramount?: { _TEXT: "Barrel" | "Side" | "Under/Barrel"; };
    forbidden?: ConditionsSchema;
    gears?: {
        usegear: OneOrMany<{
            category: { _TEXT: string; };
            name: { _TEXT: string; };
        }>;
    };
    hide?: Empty;
    id: { _TEXT: string; };
    modifyammocapacity?: { _TEXT: "* 3 div 4" | "+(Weapon * 0.5)"; };
    mount: Empty | { _TEXT: string; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    rangemodifier?: { _TEXT: IntegerString; };
    rating: { _TEXT: IntegerString; };
    rc?: { _TEXT: IntegerString; };
    rcdeployable?: { _TEXT: "True"; };
    rcgroup?: { _TEXT: IntegerString; };
    reach?: { _TEXT: IntegerString; };
    replacerange?: { _TEXT: "Heavy Pistols"; };
    required?: ConditionsSchema;
    source?: { _TEXT: IntegerString | string; };
    specialmodification?: { _TEXT: "True"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface Weapon {
    accessories?: {
        accessory: OneOrMany<{
            gears?: {
                usegear: OneOrMany<{
                    category: { _TEXT: "Autosofts" | "Commlinks" | "Sensors" | "Software" | "Vision Enhancements"; };
                    name: { _TEXT: string; $?: { select: "Krime Ripper" | "Longarms"; }; };
                    rating?: { _TEXT: IntegerString; };
                }>;
            };
            mount?: { _TEXT: "Side" | "Stock" | "Top" | "Under"; };
            name: { _TEXT: string; };
            rating?: { _TEXT: IntegerString; };
        }>;
    };
    accessorymounts?: {
        mount: OneOrMany<{ _TEXT: "Barrel" | "Side" | "Stock" | "Top" | "Under"; }>;
    };
    accuracy: { _TEXT: IntegerString | string; };
    addweapon?: OneOrMany<{ _TEXT: string; }>;
    allowaccessory?: { _TEXT: "False" | "True"; };
    allowgear?: {
        gearcategory: Many<{ _TEXT: "Drugs" | "Toxins"; }>;
    };
    alternaterange?: { _TEXT: "Harpoon Gun (Underwater)" | "Shotguns (flechette)"; };
    ammo: { _TEXT: IntegerString | string; };
    ammocategory?: { _TEXT: string; };
    ammoslots?: { _TEXT: IntegerString; };
    ap: { _TEXT: IntegerString | string; };
    avail: { _TEXT: IntegerString | string; };
    category: { _TEXT: string; };
    conceal: { _TEXT: IntegerString; };
    cost: { _TEXT: IntegerString | "{Rating}*20" | "{Rating}*50"; };
    cyberware?: { _TEXT: "True"; };
    damage: { _TEXT: IntegerString | string; };
    doubledcostaccessorymounts?: {
        mount: { _TEXT: "Barrel"; };
    };
    extramount?: { _TEXT: "Side" | "Under"; };
    hide?: Empty;
    id: { _TEXT: string; };
    maxrating?: { _TEXT: IntegerString; };
    mode: { _TEXT: IntegerString | string; };
    mount?: { _TEXT: "Barrel" | "Under"; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    range?: { _TEXT: string; };
    rc: { _TEXT: IntegerString | "-"; };
    reach: { _TEXT: IntegerString; };
    requireammo?: { _TEXT: "False" | "microtorpedo"; };
    required?: ConditionsSchema;
    shortburst?: { _TEXT: IntegerString; };
    singleshot?: { _TEXT: IntegerString; };
    sizecategory?: { _TEXT: string; };
    source?: { _TEXT: IntegerString | string; };
    spec?: { _TEXT: string; };
    spec2?: { _TEXT: "Aerodynamic" | "Non-Aerodynamic" | "Revolvers" | "Semi-Automatics"; };
    type: { _TEXT: "Melee" | "Ranged"; };
    underbarrels?: {
        underbarrel: OneOrMany<{ _TEXT: string; }>;
    };
    useskill?: { _TEXT: string; };
    useskillspec?: { _TEXT: string; };
    weapontype?: { _TEXT: string; };
    weight?: { _TEXT: IntegerString; };
    wirelessweaponbonus?: {
        accuracy: { _TEXT: IntegerString; };
    };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface WeaponsSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema weapons.xsd"; };
    accessories: {
        accessory: Many<Accessory>;
    };
    categories: {
        category: Many<{ _TEXT: string; $: { blackmarket: "Weapons"; gunneryspec?: "Artillery" | "Ballistic" | "Energy" | "Rocket"; translate?: string; type: string; }; }>;
    };
    weapons: {
        weapon: Many<Weapon>;
    };
};
