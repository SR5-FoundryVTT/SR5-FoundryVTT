// AUTO‑GENERATED — DO NOT EDIT - Check utils/generate_schemas.py for more info

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany, IntegerString } from './Types';

export interface Cyberware {
    addparentweaponaccessory?: { _TEXT: "External Clip Port" | "Laser Sight" | "Overclocked" | "Silencer/Suppressor"; };
    addtoparentcapacity?: Empty;
    addtoparentess?: Empty;
    addvehicle?: { _TEXT: "Ocular Drone" | "Remote Cyberhand"; };
    addweapon?: { _TEXT: string; };
    allowgear?: Empty | {
        gearcategory?: OneOrMany<{ _TEXT: string; }>;
        gearname?: Many<{ _TEXT: "Medkit" | "Medkit (2050)" | "Medkit (Bullets & Bandages)" | "Savior Medkit"; }>;
    };
    allowsubsystems?: {
        category: OneOrMany<{ _TEXT: string; }>;
    };
    avail: { _TEXT: IntegerString | string; };
    bannedgrades?: {
        grade: Many<{ _TEXT: "Greyware" | "Greyware (Adapsin)" | "Used" | "Used (Adapsin)"; }>;
    };
    blocksmounts?: { _TEXT: string; };
    bonus?: BonusSchema;
    capacity: { _TEXT: IntegerString | string; };
    category: { _TEXT: string; };
    cost: { _TEXT: IntegerString | string; };
    devicerating?: { _TEXT: "{Rating}"; };
    ess: { _TEXT: IntegerString | string; };
    forbidden?: ConditionsSchema;
    forcegrade?: { _TEXT: "None" | "Standard"; };
    gears?: {
        usegear: {
            category: { _TEXT: "Commlink Accessories" | "Tools"; };
            name: { _TEXT: "Sim Module, Hot" | "Universal Connector Cord"; };
            rating?: { _TEXT: IntegerString; };
        };
    };
    hide?: Empty;
    id: { _TEXT: string; };
    inheritattributes?: Empty;
    limbslot?: { _TEXT: "all" | "arm" | "leg" | "skull" | "torso"; };
    limbslotcount?: { _TEXT: "all"; };
    limit?: { _TEXT: IntegerString | "False" | "{arm}" | "{arm} * 5" | "{leg}" | "{skull}" | "{torso}"; };
    minrating?: { _TEXT: IntegerString | "{AGIMinimum}+1" | "{STRMinimum}+1"; };
    modularmount?: { _TEXT: "ankle" | "elbow" | "hip" | "knee" | "shoulder" | "wrist"; };
    mountsto?: { _TEXT: "ankle" | "elbow" | "hip" | "knee" | "shoulder" | "wrist"; };
    name: { _TEXT: string; };
    notes?: { _TEXT: "Bone Lacing does not increase your BOD score, only tests for resisting damage."; };
    page?: { _TEXT: IntegerString; };
    pairbonus?: {
        conditionmonitor?: {
            physical: { _TEXT: IntegerString; };
        };
        limitmodifier?: {
            condition: { _TEXT: "LimitCondition_InUse" | "LimitCondition_SkillGroupStealth"; };
            limit: { _TEXT: "Physical"; };
            value: { _TEXT: IntegerString; };
        };
        runmultiplier?: {
            category: { _TEXT: "Ground"; };
            percent?: { _TEXT: IntegerString; };
            val?: { _TEXT: IntegerString; };
        };
        selectskill?: {
            $: { knowledgeskills: "False"; };
            val: { _TEXT: IntegerString; };
        };
        specificskill?: {
            bonus: { _TEXT: IntegerString; };
            name: { _TEXT: "Palming" | "Swimming"; };
        };
        sprintbonus?: {
            category: { _TEXT: "Swim"; };
            percent: { _TEXT: IntegerString; };
        };
        walkmultiplier?: {
            category: { _TEXT: "Ground" | "Swim"; };
            percent: { _TEXT: IntegerString; };
        };
        weaponaccuracy?: {
            name: { _TEXT: "Raptor Foot"; };
            value: { _TEXT: IntegerString; };
        };
    };
    pairinclude?: {
        name: Many<{ _TEXT: string; }>;
    };
    programs?: { _TEXT: "Rating"; };
    rating?: { _TEXT: IntegerString | "{AGIMaximum}" | "{STRMaximum}"; };
    ratinglabel?: { _TEXT: "Rating_LengthInCmBy10" | "Rating_Meters"; };
    removalcost?: { _TEXT: IntegerString; };
    required?: ConditionsSchema;
    requireparent?: Empty;
    selectside?: Empty;
    source?: { _TEXT: IntegerString | "BB" | "CF" | "HS" | "HT" | "KC" | "LCD" | "NF" | "R5" | "SAG" | "SR5" | "TCT" | "TSG"; };
    subsystems?: {
        bioware?: OneOrMany<{
            forced?: { _TEXT: "Automatics" | "Locksmith" | "Pistols" | "Unarmed Combat"; };
            name: { _TEXT: string; };
            rating?: { _TEXT: IntegerString; };
        }>;
        cyberware: OneOrMany<{
            forced?: { _TEXT: "Left" | "Right"; };
            gears?: {
                usegear: {
                    category: { _TEXT: "Commlinks"; };
                    name: { _TEXT: "MCT-5000" | "Shiawase Jishi" | "Sony Ronin" | "Transys Avalon"; };
                };
            };
            name: { _TEXT: string; };
            rating?: { _TEXT: IntegerString; };
            subsystems?: {
                cyberware: Many<{
                    name: { _TEXT: string; };
                    rating?: { _TEXT: IntegerString; };
                }>;
            };
        }>;
    };
    wirelessbonus?: {
        limitmodifier?: Many<{
            condition: { _TEXT: "LimitCondition_Skillwires"; };
            limit: { _TEXT: "Mental" | "Physical" | "Social"; };
            value: { _TEXT: IntegerString; };
        }>;
        skillcategory?: {
            bonus: { _TEXT: IntegerString; };
            name: { _TEXT: "Combat Active"; };
        };
        specificskill?: {
            bonus: { _TEXT: IntegerString; };
            name: { _TEXT: "Navigation" | "Perception"; };
        };
    };
    wirelesspairbonus?: {
        $: { mode: "replace"; };
        disablequality?: { _TEXT: "3564b678-7721-4a8d-ac79-1600cf92dc14"; };
        initiativepass?: { _TEXT: "Rating"; $: { precedence: IntegerString; }; };
        specificattribute: {
            $: { precedence: IntegerString; };
            aug: { _TEXT: "FixedValues(0,0,1)"; };
            name: { _TEXT: "REA"; };
            val: { _TEXT: "Rating"; };
        };
    };
    wirelesspairinclude?: {
        $: { includeself: "False"; };
        name: { _TEXT: "Reaction Enhancers" | "Wired Reflexes"; };
    };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface Grade {
    avail: { _TEXT: IntegerString; };
    bonus?: BonusSchema;
    cost: { _TEXT: IntegerString; };
    devicerating: { _TEXT: IntegerString; };
    ess: { _TEXT: IntegerString; };
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page?: { _TEXT: IntegerString; };
    source?: { _TEXT: "BTB" | "CF" | "SG" | "SR5"; };
    translate?: { _TEXT: string; };
    altpage?: { _TEXT: string; };
};

export interface CyberwareSchema {
    $: { xmlns: ""; "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"; "xsi:schemaLocation": "http://www.w3.org/2001/XMLSchema cyberware.xsd"; };
    categories: {
        category: Many<{ _TEXT: string; $: { blackmarket: "Cyberware" | "Nanoware"; translate?: string; }; }>;
    };
    cyberwares: {
        cyberware: Many<Cyberware>;
    };
    grades: {
        grade: Many<Grade>;
    };
};
