// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface ConditionsSchema {
    allof?: {
        art?: { _TEXT: "Invocation"; };
        attribute?: {
            name: { _TEXT: "MAG"; };
            total: { _TEXT: IntegerString; };
        };
        critterpower?: { _TEXT: "Dual Natured"; };
        cyberware?: OneOrMany<{ _TEXT: string; }>;
        ess?: { _TEXT: IntegerString; };
        group?: Many<{
            critterpower?: { _TEXT: "Armor"; };
            quality?: { _TEXT: "Infected: Fomoraig"; };
        }>;
        initiategrade?: { _TEXT: IntegerString; };
        magenabled?: Empty;
        metamagic?: { _TEXT: "Advanced Alchemy" | "Home Advantage" | "Patronage" | "Sacrifice"; };
        metamagicart?: { _TEXT: string; };
        metatype?: { _TEXT: "Centaur" | "Dwarf" | "Elf" | "Human" | "Naga" | "Ork" | "Pixie" | "Sasquatch" | "Troll"; };
        power?: OneOrMany<{ _TEXT: string; }>;
        quality?: OneOrMany<{ _TEXT: string; }>;
        resenabled?: Empty;
        skill?: OneOrMany<{
            name: { _TEXT: string; };
            type?: { _TEXT: "Knowledge"; };
            val: { _TEXT: IntegerString; };
        }>;
        spell?: { _TEXT: "Attune Animal" | "Create Ally Spirit" | "Fling" | "[Critter] Form"; };
        spellcategory?: Many<{
            count: { _TEXT: IntegerString; };
            name: { _TEXT: "Combat" | "Detection" | "Health" | "Illusion" | "Manipulation"; };
        }>;
        submersiongrade?: { _TEXT: IntegerString; };
    };
    geardetails?: {
        OR?: {
            AND?: {
                attack?: { _TEXT: IntegerString; $: { operation: "greaterthan"; }; };
                dataprocessing?: { _TEXT: IntegerString; $: { operation: "greaterthan"; }; };
                firewall?: { _TEXT: IntegerString; $: { operation: "greaterthan"; }; };
                sleaze?: { _TEXT: IntegerString; $: { operation: "greaterthan"; }; };
            };
            NONE?: Empty;
            attack?: OneOrMany<{ _TEXT?: IntegerString; $?: { NOT?: string; operation: "exists" | "greaterthan"; }; }>;
            attributearray?: { $: { operation: "exists"; }; };
            category?: OneOrMany<{ _TEXT: string; }>;
            dataprocessing?: { _TEXT: IntegerString; $: { operation: "greaterthan"; }; };
            firewall?: { _TEXT: IntegerString; $: { operation: "greaterthan"; }; };
            name?: OneOrMany<{ _TEXT: string; $?: { operation: "contains"; }; }>;
            sleaze?: OneOrMany<{ _TEXT?: IntegerString; $?: { NOT?: string; operation: "exists" | "greaterthan"; }; }>;
        };
        attributearray?: { $: { NOT?: string; operation: "exists"; }; };
        category?: { _TEXT: "Drugs"; };
        name?: { _TEXT: "Altskin" | "Binoculars (2050)" | "Goggles (2050)"; };
    };
    oneof?: {
        accessory?: OneOrMany<{ _TEXT: string; }>;
        armormod?: { _TEXT: "Responsive Interface Gear: Armor"; $: { sameparent: "True"; }; };
        bioware?: OneOrMany<{ _TEXT: string; }>;
        critterpower?: { _TEXT: "Essence Drain"; };
        cyberware?: { _TEXT: "Control Rig" | "Reaction Enhancers" | "Wired Reflexes"; };
        ess?: OneOrMany<{ _TEXT: IntegerString; $?: { grade: string; }; }>;
        gameplayoption?: { _TEXT: "Prime Runner"; };
        gear?: { _TEXT: "Fake SIN"; $: { minrating: IntegerString; }; };
        group?: OneOrMany<{
            grouponeof?: {
                tradition: Many<{ _TEXT: "Black Magic" | "Black Magic [Alt]"; }>;
            };
            initiategrade?: { _TEXT: IntegerString; };
            martialtechnique?: { _TEXT: "Dim Mak"; };
            power?: { _TEXT: "Killing Hands" | "Nerve Strike"; };
            quality?: { _TEXT: "Adept" | "Mystic Adept"; };
            skill?: OneOrMany<{
                name: { _TEXT: string; };
                spec?: { _TEXT: string; };
                type?: { _TEXT: "Knowledge"; };
                val: { _TEXT: IntegerString; };
            }>;
            spell?: { _TEXT: "Shapechange" | "[Critter] Form"; };
            tradition?: { _TEXT: "Buddhism" | "Chaos Magic" | "Islam" | "Red Magic" | "Sioux" | "Wicca" | "Wuxing"; };
        }>;
        magenabled?: Empty;
        metamagic?: { _TEXT: "Spell Shaping"; };
        metamagicart?: { _TEXT: "Advanced Ritual Casting" | "Geomancy"; };
        metatype?: OneOrMany<{ _TEXT: "A.I." | "Centaur" | "Dwarf" | "Elf" | "Human" | "Naga" | "Ork" | "Pixie" | "Sasquatch" | "Troll"; }>;
        metatypecategory?: { _TEXT: "Shapeshifter"; };
        power?: { _TEXT: string; };
        quality?: OneOrMany<{ _TEXT: string; }>;
        skill?: OneOrMany<{
            name: { _TEXT: string; };
            spec?: { _TEXT: string; };
            type?: { _TEXT: "Knowledge"; };
            val: { _TEXT: IntegerString; };
        }>;
        specialmodificationlimit?: { _TEXT: IntegerString; };
        spell?: Many<{ _TEXT: "Shapechange" | "[Critter] Form"; }>;
        spelldescriptor?: {
            count: { _TEXT: IntegerString; };
            name: { _TEXT: "Elemental"; };
        };
        tradition?: { _TEXT: "Toxic"; };
        weapondetails?: {
            OR: {
                ammo: Many<{ _TEXT: "(cy)" | "(d)"; $: { operation: "contains"; }; }>;
            };
        };
    };
    parentdetails?: {
        NONE?: Empty;
        OR?: {
            NONE?: Empty;
            name: Many<{ _TEXT: string; $?: { operation: "contains"; }; }>;
        };
        ammoforweapontype?: { _TEXT: "bow"; };
        category?: { _TEXT: "Cyber Implant Weapon" | "Cyberlimb" | "Headware"; };
        name?: { _TEXT: "Cyberdeck" | "Flametosser" | "Full Body Armor" | "Micro-Hardpoint"; };
    };
    tradition?: { _TEXT: "Toxic"; };
    vehicledetails?: {
        OR?: {
            category?: Many<{ _TEXT: string; $?: { operation: "contains"; }; }>;
            name?: OneOrMany<{ _TEXT: string; }>;
        };
        body?: { _TEXT: IntegerString; $: { operation: "lessthanequals"; }; };
        category?: { _TEXT: "Drones"; $: { operation: "contains"; }; };
        name?: { _TEXT: string; $?: { operation: "contains"; }; };
        seats?: { _TEXT: IntegerString; $: { operation: "greaterthanequals"; }; };
    };
    weapondetails?: {
        OR?: OneOrMany<{
            $?: { NOT: string; };
            AND?: {
                OR: {
                    category: Many<{ _TEXT: string; }>;
                };
                useskill: { $: { NOT: string; operation: "exists"; }; };
            };
            ammo?: OneOrMany<{ _TEXT: "(belt)" | "(c)" | "(d)" | "(m)" | "Energy" | "External Source"; $: { operation: "contains"; }; }>;
            ammocategory?: Many<{ _TEXT: "Grenade Launchers" | "Missile Launchers"; }>;
            category?: OneOrMany<{ _TEXT: string; $?: { operation: "contains"; }; }>;
            conceal?: { _TEXT: IntegerString; $: { operation: "lessthanequals"; }; };
            name?: OneOrMany<{ _TEXT: string; }>;
            spec?: OneOrMany<{ _TEXT: "Bow" | "Grenade Launchers" | "Missile Launchers"; }>;
            spec2?: Many<{ _TEXT: "Grenade Launchers" | "Missile Launchers"; }>;
            useskill?: OneOrMany<{ _TEXT: "Heavy Weapons" | "Longarms"; }>;
        }>;
        accessorymounts?: {
            mount: { _TEXT: "Stock"; };
        };
        ammo?: { _TEXT: "(cy)"; $: { operation: "contains"; }; };
        conceal?: { _TEXT: IntegerString; $: { operation: "greaterthan" | "greaterthanequals" | "lessthanequals"; }; };
        damage?: { _TEXT: "S(e)"; $: { operation: "contains"; }; };
        id?: { _TEXT: string; };
        mode?: { _TEXT: "SA"; $: { operation: "contains"; }; };
        name?: { _TEXT: string; $?: { operation: "contains"; }; };
        type?: { _TEXT: "Melee"; };
    };
    weaponmountdetails?: {
        control: OneOrMany<{ _TEXT: "Manual [SR5]" | "None" | "Remote [SR5]"; }>;
        flexibility: { _TEXT: "Flexible [SR5]" | "None"; };
        visibility: { _TEXT: "External [SR5]" | "None"; };
    };
};
