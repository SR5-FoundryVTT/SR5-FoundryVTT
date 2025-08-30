// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface Mod {
    ammobonus?: { _TEXT: IntegerString; };
    ammobonuspercent?: { _TEXT: IntegerString; };
    ammoreplace?: { _TEXT: "100(belt)"; };
    avail: { _TEXT: IntegerString | string; };
    bonus?: BonusSchema;
    capacity?: { _TEXT: IntegerString; };
    category: { _TEXT: string; };
    conditionmonitor?: { _TEXT: IntegerString; };
    cost: { _TEXT: IntegerString | string; };
    downgrade?: Empty;
    forbidden?: ConditionsSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    minrating?: { _TEXT: "Acceleration + 1" | "Armor + 1" | "Handling + 1" | "Sensor + 1" | "Speed + 1"; };
    name: { _TEXT: string; };
    optionaldrone?: Empty;
    page?: { _TEXT: IntegerString | "?"; };
    rating: { _TEXT: IntegerString | "Seats" | "body" | "qty"; };
    ratinglabel?: { _TEXT: "String_Hours" | "String_UpgradedRating"; };
    required?: ConditionsSchema;
    slots: { _TEXT: IntegerString | string; };
    source?: { _TEXT: IntegerString | string; };
    subsystems?: {
        subsystem: Many<{ _TEXT: string; }>;
    };
    weaponmountcategories?: { _TEXT: string; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface Vehicle {
    accel: { _TEXT: IntegerString | "1/1" | "1/2" | "1/3" | "2/3" | "2/4" | "3/2"; };
    armor: { _TEXT: IntegerString; };
    avail: { _TEXT: IntegerString | string; };
    body: { _TEXT: IntegerString; };
    bodymodslots?: { _TEXT: IntegerString; };
    category: { _TEXT: string; };
    cosmeticmodslots?: { _TEXT: IntegerString; };
    cost: { _TEXT: IntegerString | "Variable(700-1500)"; };
    electromagneticmodslots?: { _TEXT: IntegerString; };
    gears?: {
        gear: OneOrMany<{
            $?: { consumecapacity?: "True"; costfor?: IntegerString; rating?: IntegerString; select?: string; };
            gears?: {
                gear: Many<{
                    $?: { consumecapacity: "True"; rating: IntegerString; };
                    gears?: {
                        gear: Many<{
                            id: { _TEXT: "287c6d58-2217-48b2-9e14-6ba23584939a" | "f7f74a85-bd3b-4a46-9c3b-80688c72ef51"; };
                        }>;
                    };
                    id?: { _TEXT: string; };
                    rating?: { _TEXT: IntegerString; };
                    _TEXT?: string;
                }>;
            };
            maxrating?: { _TEXT: IntegerString; };
            name?: { _TEXT: "Grenade: Flash-Pak" | "Holster" | "Medkit" | "Sensor Array"; };
            qty?: { _TEXT: IntegerString; };
            rating?: { _TEXT: IntegerString; };
            _TEXT?: string;
        }>;
    };
    handling: { _TEXT: IntegerString | string; };
    hide?: Empty;
    id: { _TEXT: string; };
    mods?: {
        addslots?: { _TEXT: IntegerString; };
        mod?: Many<{
            name: { _TEXT: "Drone Arm"; };
            subsystems: {
                cyberware: {
                    name: { _TEXT: "Snake Fingers"; };
                };
            };
        }>;
        name: OneOrMany<{ _TEXT: string; $?: { cost?: IntegerString; rating?: IntegerString; select?: string; }; }>;
    };
    modslots?: { _TEXT: IntegerString; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    pilot: { _TEXT: IntegerString; };
    powertrainmodslots?: { _TEXT: IntegerString; };
    protectionmodslots?: { _TEXT: IntegerString; };
    seats?: { _TEXT: IntegerString; };
    sensor: { _TEXT: IntegerString; };
    source?: { _TEXT: IntegerString | string; };
    speed: { _TEXT: IntegerString | string; };
    weaponmodslots?: { _TEXT: IntegerString; };
    weaponmounts?: {
        weaponmount: OneOrMany<{
            allowedweapons?: { _TEXT: string; };
            control: { _TEXT: "Armored Manual" | "Manual" | "Remote"; };
            flexibility: { _TEXT: "Fixed" | "Flexible" | "Turret"; };
            mods?: {
                mod: { _TEXT: "Ammo Bin" | "Expanded Ammunition Bay (Second Bin) Weapon Mount Add-on (Drone)"; };
            };
            size: { _TEXT: string; };
            visibility: { _TEXT: "Concealed" | "External" | "Internal"; };
        }>;
    };
    weapons?: {
        weapon: OneOrMany<{
            name: { _TEXT: string; };
        }>;
    };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface Weaponmount {
    avail: { _TEXT: IntegerString | "10F" | "12F" | "14F" | "16F" | "20F" | "4R" | "6F" | "8F" | "8R"; };
    category: { _TEXT: "Control" | "Flexibility" | "Size" | "Visibility"; };
    cost: { _TEXT: IntegerString; };
    forbidden?: ConditionsSchema;
    hide?: Empty;
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    optionaldrone?: Empty;
    page?: { _TEXT: IntegerString; };
    required?: ConditionsSchema;
    slots: { _TEXT: IntegerString; };
    source?: { _TEXT: "R5" | "SR5"; };
    weaponcategories?: { _TEXT: string; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface VehiclesSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema vehicles.xsd"; };
    categories: {
        category: Many<{ _TEXT: string; $: { blackmarket: "Vehicles"; translate?: string; }; }>;
    };
    modcategories: {
        category: Many<{ _TEXT: string; $: { blackmarket: "Software,Vehicles" | "Vehicles"; translate?: string; }; }>;
    };
    mods: {
        mod: Many<Mod>;
    };
    vehicles: {
        vehicle: Many<Vehicle>;
    };
    weaponmountcategories: {
        category: { _TEXT: "Size"; $: { blackmarket: "Vehicles"; }; };
    };
    weaponmountmods: {
        mod: Many<Mod>;
    };
    weaponmounts: {
        weaponmount: Many<Weaponmount>;
    };
};
