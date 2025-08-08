// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Gear {
    addoncategory?: OneOrMany<{ _TEXT: string; }>;
    addweapon?: { _TEXT: string; $?: { rating: string; }; };
    allowgear?: {
        name: Many<{ _TEXT: string; }>;
    };
    allowrename?: { _TEXT: string; };
    ammoforweapontype?: { _TEXT: string; $?: { noextra: string; }; };
    armorcapacity?: { _TEXT: string; };
    attack?: { _TEXT: string; };
    attributearray?: { _TEXT: string; };
    avail: { _TEXT: string; };
    bonus?: BonusSchema;
    canformpersona?: { _TEXT: string; };
    capacity?: { _TEXT: string; };
    category: { _TEXT: string; };
    cost: { _TEXT: string; };
    costfor?: { _TEXT: string; };
    dataprocessing?: { _TEXT: string; };
    devicerating?: { _TEXT: string; };
    firewall?: { _TEXT: string; };
    flechetteweaponbonus?: {
        ap?: { _TEXT: string; };
        damage?: { _TEXT: string; };
        damagetype: { _TEXT: string; };
    };
    forbidden?: ConditionsSchema;
    gears?: {
        $?: { startcollapsed: string; };
        usegear: OneOrMany<{
            capacity?: { _TEXT: string; };
            category: { _TEXT: string; };
            gears?: {
                usegear: {
                    category: { _TEXT: string; };
                    name: { _TEXT: string; };
                };
            };
            maxrating?: { _TEXT: string; };
            name: { _TEXT: string; $?: { select: string; }; };
            rating?: { _TEXT: string; };
        }>;
    };
    hide?: Empty;
    id: { _TEXT: string; };
    isflechetteammo?: { _TEXT: string; };
    matrixcmbonus?: { _TEXT: string; };
    minrating?: { _TEXT: string; };
    modattack?: { _TEXT: string; };
    modattributearray?: { _TEXT: string; };
    moddataprocessing?: { _TEXT: string; };
    modfirewall?: { _TEXT: string; };
    modsleaze?: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    programs?: { _TEXT: string; };
    rating: { _TEXT: string; };
    ratinglabel?: { _TEXT: string; };
    required?: ConditionsSchema;
    requireparent?: Empty;
    sleaze?: { _TEXT: string; };
    source: { _TEXT: string; };
    weaponbonus?: {
        accuracy?: { _TEXT: string; };
        accuracyreplace?: { _TEXT: string; };
        ap?: { _TEXT: string; };
        apreplace?: { _TEXT: string; };
        damage?: { _TEXT: string; };
        damagereplace?: { _TEXT: string; };
        damagetype?: { _TEXT: string; };
        modereplace?: { _TEXT: string; };
        smartlinkpool?: { _TEXT: string; };
        userange?: { _TEXT: string; };
    };
    weight?: { _TEXT: string; };
    translate?: { _TEXT: string; };
};

export interface GearSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    categories: {
        category: Many<{ _TEXT: string; $?: { blackmarket: string; translate?: string; }; }>;
    };
    gears: {
        gear: Many<Gear>;
    };
};
