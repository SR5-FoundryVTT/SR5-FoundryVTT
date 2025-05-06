// AUTO‑GENERATED — DO NOT EDIT

import { BonusSchema } from './BonusSchema';
import { ConditionsSchema } from './ConditionsSchema';
import { Empty, Many, OneOrMany } from './Types';

export interface Cyberware {
    addparentweaponaccessory?: { _TEXT: string; };
    addtoparentcapacity?: Empty;
    addtoparentess?: Empty;
    addvehicle?: { _TEXT: string; };
    addweapon?: { _TEXT: string; };
    allowgear?: Empty | {
        gearcategory?: OneOrMany<{ _TEXT: string; }>;
        gearname?: Many<{ _TEXT: string; }>;
    };
    allowsubsystems?: {
        category: OneOrMany<{ _TEXT: string; }>;
    };
    avail: { _TEXT: string; };
    bannedgrades?: {
        grade: Many<{ _TEXT: string; }>;
    };
    bannedwaregrades?: {
        grade: Many<{ _TEXT: string; }>;
    };
    blocksmounts?: { _TEXT: string; };
    bonus?: BonusSchema;
    capacity: { _TEXT: string; };
    category: { _TEXT: string; };
    cost: { _TEXT: string; };
    devicerating?: { _TEXT: string; };
    ess: { _TEXT: string; };
    forbidden?: ConditionsSchema;
    forcegrade?: { _TEXT: string; };
    gears?: {
        usegear: {
            category: { _TEXT: string; };
            name: { _TEXT: string; };
            rating?: { _TEXT: string; };
        };
    };
    hide?: Empty;
    id: { _TEXT: string; };
    inheritattributes?: Empty;
    limbslot?: { _TEXT: string; };
    limbslotcount?: { _TEXT: string; };
    limit?: { _TEXT: string; };
    minrating?: { _TEXT: string; };
    modularmount?: { _TEXT: string; };
    mountsto?: { _TEXT: string; };
    name: { _TEXT: string; };
    notes?: { _TEXT: string; };
    page: { _TEXT: string; };
    pairbonus?: {
        conditionmonitor?: {
            physical: { _TEXT: string; };
        };
        limitmodifier?: {
            condition: { _TEXT: string; };
            limit: { _TEXT: string; };
            value: { _TEXT: string; };
        };
        runmultiplier?: {
            category: { _TEXT: string; };
            percent?: { _TEXT: string; };
            val?: { _TEXT: string; };
        };
        selectskill?: {
            $: { knowledgeskills: string; };
            val: { _TEXT: string; };
        };
        specificskill?: {
            bonus: { _TEXT: string; };
            name: { _TEXT: string; };
        };
        sprintbonus?: {
            category: { _TEXT: string; };
            percent: { _TEXT: string; };
        };
        walkmultiplier?: {
            category: { _TEXT: string; };
            percent: { _TEXT: string; };
        };
        weaponaccuracy?: {
            name: { _TEXT: string; };
            value: { _TEXT: string; };
        };
    };
    pairinclude?: {
        name: Many<{ _TEXT: string; }>;
    };
    programs?: { _TEXT: string; };
    rating?: { _TEXT: string; };
    ratinglabel?: { _TEXT: string; };
    removalcost?: { _TEXT: string; };
    required?: ConditionsSchema;
    requireparent?: Empty;
    selectside?: Empty;
    source: { _TEXT: string; };
    subsystems?: {
        bioware?: OneOrMany<{
            forced?: { _TEXT: string; };
            name: { _TEXT: string; };
            rating?: { _TEXT: string; };
        }>;
        cyberware: OneOrMany<{
            forced?: { _TEXT: string; };
            gears?: {
                usegear: {
                    category: { _TEXT: string; };
                    name: { _TEXT: string; };
                };
            };
            name: { _TEXT: string; };
            rating?: { _TEXT: string; };
            subsystems?: {
                cyberware: Many<{
                    name: { _TEXT: string; };
                    rating?: { _TEXT: string; };
                }>;
            };
        }>;
    };
    wirelessbonus?: {
        limitmodifier?: Many<{
            condition: { _TEXT: string; };
            limit: { _TEXT: string; };
            value: { _TEXT: string; };
        }>;
        skillcategory?: {
            bonus: { _TEXT: string; };
            name: { _TEXT: string; };
        };
        specificskill?: {
            bonus: { _TEXT: string; };
            name: { _TEXT: string; };
        };
    };
    wirelesspairbonus?: {
        $: { mode: string; };
        disablequality?: { _TEXT: string; };
        initiativepass?: { _TEXT: string; $: { precedence: string; }; };
        specificattribute: {
            $: { precedence: string; };
            aug: { _TEXT: string; };
            name: { _TEXT: string; };
            val: { _TEXT: string; };
        };
    };
    wirelesspairinclude?: {
        $: { includeself: string; };
        name: { _TEXT: string; };
    };
};

export interface Grade {
    avail: { _TEXT: string; };
    bonus?: BonusSchema;
    cost: { _TEXT: string; };
    devicerating: { _TEXT: string; };
    ess: { _TEXT: string; };
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    page: { _TEXT: string; };
    source: { _TEXT: string; };
};

export interface CyberwareSchema {
    $: { xmlns: string; "xmlns:xsi": string; "xsi:schemaLocation": string; };
    categories: {
        category: Many<{ _TEXT: string; $: { blackmarket: string; }; }>;
    };
    cyberwares: {
        cyberware: Many<Cyberware>;
    };
    grades: {
        grade: Many<Grade>;
    };
};
