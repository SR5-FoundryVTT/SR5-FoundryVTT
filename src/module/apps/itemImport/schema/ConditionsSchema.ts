// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { Empty, Many, OneOrMany } from './Types';

export interface ConditionsSchema {
    allof?: {
        art?: { _TEXT: string; };
        attribute?: {
            name: { _TEXT: string; };
            total: { _TEXT: string; };
        };
        critterpower?: { _TEXT: string; };
        cyberware?: OneOrMany<{ _TEXT: string; }>;
        ess?: { _TEXT: string; };
        group?: Many<{
            critterpower?: { _TEXT: string; };
            quality?: { _TEXT: string; };
        }>;
        initiategrade?: { _TEXT: string; };
        magenabled?: Empty;
        metamagic?: { _TEXT: string; };
        metamagicart?: { _TEXT: string; };
        metatype?: { _TEXT: string; };
        power?: OneOrMany<{ _TEXT: string; }>;
        quality?: OneOrMany<{ _TEXT: string; }>;
        resenabled?: Empty;
        skill?: OneOrMany<{
            name: { _TEXT: string; };
            type?: { _TEXT: string; };
            val: { _TEXT: string; };
        }>;
        spell?: { _TEXT: string; };
        spellcategory?: Many<{
            count: { _TEXT: string; };
            name: { _TEXT: string; };
        }>;
        submersiongrade?: { _TEXT: string; };
    };
    geardetails?: {
        OR?: {
            AND?: {
                attack?: { _TEXT: string; $: { operation: string; }; };
                dataprocessing?: { _TEXT: string; $: { operation: string; }; };
                firewall?: { _TEXT: string; $: { operation: string; }; };
                sleaze?: { _TEXT: string; $: { operation: string; }; };
            };
            NONE?: Empty;
            attack?: OneOrMany<{ _TEXT?: string; $?: { NOT?: string; operation: string; }; }>;
            attributearray?: { $: { operation: string; }; };
            category?: OneOrMany<{ _TEXT: string; }>;
            dataprocessing?: { _TEXT: string; $: { operation: string; }; };
            firewall?: { _TEXT: string; $: { operation: string; }; };
            name?: OneOrMany<{ _TEXT: string; $?: { operation: string; }; }>;
            sleaze?: OneOrMany<{ _TEXT?: string; $?: { NOT?: string; operation: string; }; }>;
        };
        attributearray?: { $: { NOT?: string; operation: string; }; };
        category?: { _TEXT: string; };
        name?: { _TEXT: string; };
    };
    oneof?: {
        accessory?: OneOrMany<{ _TEXT: string; }>;
        armormod?: { _TEXT: string; $: { sameparent: string; }; };
        bioware?: OneOrMany<{ _TEXT: string; }>;
        critterpower?: { _TEXT: string; };
        cyberware?: { _TEXT: string; };
        ess?: OneOrMany<{ _TEXT: string; $?: { grade: string; }; }>;
        gameplayoption?: { _TEXT: string; };
        gear?: { _TEXT: string; $: { minrating: string; }; };
        group?: OneOrMany<{
            grouponeof?: {
                tradition: Many<{ _TEXT: string; }>;
            };
            initiategrade?: { _TEXT: string; };
            martialtechnique?: { _TEXT: string; };
            power?: { _TEXT: string; };
            quality?: { _TEXT: string; };
            skill?: OneOrMany<{
                name: { _TEXT: string; };
                spec?: { _TEXT: string; };
                type?: { _TEXT: string; };
                val: { _TEXT: string; };
            }>;
            spell?: { _TEXT: string; };
            tradition?: { _TEXT: string; };
        }>;
        magenabled?: Empty;
        metamagic?: { _TEXT: string; };
        metamagicart?: { _TEXT: string; };
        metatype?: OneOrMany<{ _TEXT: string; }>;
        metatypecategory?: { _TEXT: string; };
        power?: { _TEXT: string; };
        quality?: OneOrMany<{ _TEXT: string; }>;
        skill?: OneOrMany<{
            name: { _TEXT: string; };
            spec?: { _TEXT: string; };
            type?: { _TEXT: string; };
            val: { _TEXT: string; };
        }>;
        specialmodificationlimit?: { _TEXT: string; };
        spell?: Many<{ _TEXT: string; }>;
        spelldescriptor?: {
            count: { _TEXT: string; };
            name: { _TEXT: string; };
        };
        tradition?: { _TEXT: string; };
        weapondetails?: {
            OR: {
                ammo: Many<{ _TEXT: string; $: { operation: string; }; }>;
            };
        };
    };
    parentdetails?: {
        NONE?: Empty;
        OR?: {
            NONE?: Empty;
            name: Many<{ _TEXT: string; $?: { operation: string; }; }>;
        };
        ammoforweapontype?: { _TEXT: string; };
        category?: { _TEXT: string; };
        name?: { _TEXT: string; };
    };
    tradition?: { _TEXT: string; };
    vehicledetails?: {
        OR?: {
            category?: Many<{ _TEXT: string; $?: { operation: string; }; }>;
            name?: OneOrMany<{ _TEXT: string; }>;
        };
        body?: { _TEXT: string; $: { operation: string; }; };
        category?: { _TEXT: string; $: { operation: string; }; };
        name?: { _TEXT: string; $?: { operation: string; }; };
        seats?: { _TEXT: string; $: { operation: string; }; };
    };
    weapondetails?: {
        OR?: OneOrMany<{
            $?: { NOT: string; };
            AND?: {
                OR: {
                    category: Many<{ _TEXT: string; }>;
                };
                useskill: { $: { NOT: string; operation: string; }; };
            };
            ammo?: OneOrMany<{ _TEXT: string; $: { operation: string; }; }>;
            ammocategory?: Many<{ _TEXT: string; }>;
            category?: OneOrMany<{ _TEXT: string; $?: { operation: string; }; }>;
            conceal?: { _TEXT: string; $: { operation: string; }; };
            name?: OneOrMany<{ _TEXT: string; }>;
            spec?: OneOrMany<{ _TEXT: string; }>;
            spec2?: Many<{ _TEXT: string; }>;
            useskill?: OneOrMany<{ _TEXT: string; }>;
        }>;
        accessorymounts?: {
            mount: { _TEXT: string; };
        };
        ammo?: { _TEXT: string; $: { operation: string; }; };
        conceal?: { _TEXT: string; $: { operation: string; }; };
        damage?: { _TEXT: string; $: { operation: string; }; };
        id?: { _TEXT: string; };
        mode?: { _TEXT: string; $: { operation: string; }; };
        name?: { _TEXT: string; $?: { operation: string; }; };
        type?: { _TEXT: string; };
    };
    weaponmountdetails?: {
        control: OneOrMany<{ _TEXT: string; }>;
        flexibility: { _TEXT: string; };
        visibility: { _TEXT: string; };
    };
};
