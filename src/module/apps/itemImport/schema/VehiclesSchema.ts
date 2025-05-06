// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Mod {
    ammobonus?: { _TEXT: string; };
    ammobonuspercent?: { _TEXT: string; };
    ammoreplace?: { _TEXT: string; };
    avail: Empty | { _TEXT: string; };
    bonus?: BonusSchema;
    capacity?: { _TEXT: string; };
    category: { _TEXT: string; };
    conditionmonitor?: { _TEXT: string; };
    cost: { _TEXT: string; };
    downgrade?: Empty;
    hide?: Empty;
    id: { _TEXT: string; };
    minrating?: { _TEXT: string; };
    name: { _TEXT: string; };
    optionaldrone?: Empty;
    page: { _TEXT: string; };
    rating: { _TEXT: string; };
    ratinglabel?: { _TEXT: string; };
    required?: ConditionsSchema;
    slots: { _TEXT: string; };
    source: { _TEXT: string; };
    subsystems?: {
        subsystem: Many<{ _TEXT: string; }>;
    };
    weaponmountcategories?: { _TEXT: string; };
};

export interface Vehicle {
    accel: { _TEXT: string; };
    armor: { _TEXT: string; };
    avail: { _TEXT: string; };
    body: { _TEXT: string; };
    bodymodslots?: { _TEXT: string; };
    category: { _TEXT: string; };
    cosmeticmodslots?: { _TEXT: string; };
    cost: { _TEXT: string; };
    electromagneticmodslots?: { _TEXT: string; };
    gears?: {
        gear: OneOrMany<{
            $?: { consumecapacity?: string; costfor?: string; rating?: string; select?: string; };
            gears?: {
                gear: Many<{ _TEXT: string; $: { consumecapacity: string; rating: string; }; }>;
            };
            maxrating?: { _TEXT: string; };
            name?: { _TEXT: string; };
            rating?: { _TEXT: string; };
            _TEXT?: string;
        }>;
    };
    handling: { _TEXT: string; };
    hide?: Empty;
    id: { _TEXT: string; };
    mods?: Empty | {
        addslots?: { _TEXT: string; };
        mod?: Many<{
            name: { _TEXT: string; };
            subsystems: {
                cyberware: {
                    name: { _TEXT: string; };
                };
            };
        }>;
        name?: OneOrMany<{ _TEXT: string; $?: { cost?: string; rating?: string; select?: string; }; }>;
    };
    modslots?: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    pilot: { _TEXT: string; };
    powertrainmodslots?: { _TEXT: string; };
    protectionmodslots?: { _TEXT: string; };
    seats?: { _TEXT: string; };
    sensor: { _TEXT: string; };
    source: { _TEXT: string; };
    speed: { _TEXT: string; };
    weaponmodslots?: { _TEXT: string; };
    weaponmounts?: {
        weaponmount: OneOrMany<{
            allowedweapons?: { _TEXT: string; };
            control: { _TEXT: string; };
            flexibility: { _TEXT: string; };
            mods?: {
                mod: { _TEXT: string; };
            };
            size: { _TEXT: string; };
            visibility: { _TEXT: string; };
        }>;
    };
    weapons?: {
        weapon: OneOrMany<{
            name: { _TEXT: string; };
        }>;
    };
};

export interface Weaponmount {
    avail: { _TEXT: string; };
    category: { _TEXT: string; };
    cost: { _TEXT: string; };
    forbidden?: ConditionsSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    optionaldrone?: Empty;
    page: { _TEXT: string; };
    required?: ConditionsSchema;
    slots: { _TEXT: string; };
    source: { _TEXT: string; };
    weaponcategories?: { _TEXT: string; };
};

export interface VehiclesSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    categories: {
        category: Many<{ _TEXT: string; $: { blackmarket: string; }; }>;
    };
    modcategories: {
        category: Many<{ _TEXT: string; $: { blackmarket: string; }; }>;
    };
    mods: {
        mod: Many<Mod>;
    };
    vehicles: {
        vehicle: Many<Vehicle>;
    };
    weaponmountcategories: {
        category: { _TEXT: string; $: { blackmarket: string; }; };
    };
    weaponmountmods: {
        mod: Many<Mod>;
    };
    weaponmounts: {
        weaponmount: Many<Weaponmount>;
    };
};
