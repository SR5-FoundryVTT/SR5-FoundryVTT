// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface Gear {
    addoncategory?: OneOrMany<{ _TEXT: string; }>;
    addweapon?: { _TEXT: string; $?: { rating: "{Rating}"; }; };
    allowgear?: {
        name: Many<{ _TEXT: "External Synthlink" | "Internal Synthlink"; }>;
    };
    allowrename?: { _TEXT: "True"; };
    ammoforweapontype?: { _TEXT: string; $?: { noextra: "True"; }; };
    armorcapacity?: { _TEXT: IntegerString | "Rating/[1]" | "[0]" | "[1]" | "[2]" | "[3]" | "[4]" | "[5]" | "[6]" | "[Rating]"; };
    attack?: { _TEXT: IntegerString | "{CHA}"; };
    attributearray?: { _TEXT: string; };
    avail: { _TEXT: IntegerString | string; };
    bonus?: BonusSchema;
    canformpersona?: { _TEXT: "Parent" | "Self"; };
    capacity?: { _TEXT: IntegerString | string; };
    category: { _TEXT: string; };
    cost: { _TEXT: IntegerString | string; };
    costfor?: { _TEXT: IntegerString; };
    dataprocessing?: { _TEXT: IntegerString | "Rating" | "{LOG}"; };
    devicerating?: { _TEXT: IntegerString | "Rating" | "{RES}" | "{Rating}"; };
    firewall?: { _TEXT: IntegerString | "Rating" | "{WIL}"; };
    flechetteweaponbonus?: {
        ap?: { _TEXT: IntegerString; };
        damage?: { _TEXT: IntegerString; };
        damagetype: { _TEXT: "P(f)" | "S(e)"; };
    };
    forbidden?: ConditionsSchema;
    gears?: {
        $?: { startcollapsed: "True"; };
        usegear: OneOrMany<{
            capacity?: { _TEXT: "2/[2]" | "[0]"; };
            category: { _TEXT: string; };
            gears?: {
                usegear: {
                    category: { _TEXT: "Software"; };
                    name: { _TEXT: "Love Life Management"; };
                };
            };
            maxrating?: { _TEXT: IntegerString; };
            name: { _TEXT: string; $?: { select: "Bracelet" | "Lunchbox" | "Urban Brawl News" | "Wristband"; }; };
            rating?: { _TEXT: IntegerString; };
        }>;
    };
    hide?: Empty;
    id: { _TEXT: string; };
    isflechetteammo?: { _TEXT: "True"; };
    matrixcmbonus?: { _TEXT: IntegerString; };
    minrating?: { _TEXT: IntegerString; };
    modattack?: { _TEXT: IntegerString | "{Rating}"; };
    modattributearray?: { _TEXT: string; };
    moddataprocessing?: { _TEXT: IntegerString | "{Rating}"; };
    modfirewall?: { _TEXT: IntegerString | "{Rating}"; };
    modsleaze?: { _TEXT: IntegerString | "{Rating}"; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    programs?: { _TEXT: IntegerString | "Rating" | "{Rating}+2"; };
    rating: { _TEXT: IntegerString | "{Parent Rating}"; };
    ratinglabel?: { _TEXT: "Rating_Meters" | "Rating_SqMeters" | "String_Force" | "String_Force_Potency"; };
    required?: ConditionsSchema;
    requireparent?: Empty;
    sleaze?: { _TEXT: IntegerString | "{INT}"; };
    source?: { _TEXT: IntegerString | string; };
    weaponbonus?: {
        accuracy?: { _TEXT: IntegerString; };
        accuracyreplace?: { _TEXT: IntegerString; };
        ap?: { _TEXT: IntegerString; };
        apreplace?: { _TEXT: IntegerString; };
        damage?: { _TEXT: IntegerString | "-2S(e)"; };
        damagereplace?: { _TEXT: string; };
        damagetype?: { _TEXT: "(M)" | "(S)" | "Acid" | "P(f)" | "S" | "S(e)"; };
        modereplace?: { _TEXT: "SS"; };
        smartlinkpool?: { _TEXT: IntegerString; };
        userange?: { _TEXT: "Holdouts" | "Light Pistols"; };
    };
    weight?: { _TEXT: IntegerString | "Rating"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface GearSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema gear.xsd"; };
    categories: {
        category: Many<{ _TEXT: string; $?: { blackmarket: string; translate?: string; }; }>;
    };
    gears: {
        gear: Many<Gear>;
    };
};
