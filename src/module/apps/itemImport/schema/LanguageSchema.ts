// AUTO‑GENERATED — DO NOT EDIT

import { Empty, Many, OneOrMany } from './Types';

export interface Languagefile {
    $: { file: string; };
    accessories?: {
        accessory: Many<{
            $?: { translated: string; };
            altpage?: Empty | { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate?: { _TEXT: string; };
        }>;
    };
    ages?: {
        age: Many<{ _TEXT: string; $: { translate: string; }; }>;
    };
    armors?: {
        armor: Many<{
            $?: { translated: string; };
            altpage?: Empty | { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate?: { _TEXT: string; };
        }>;
    };
    arts?: {
        art: Many<{
            $?: { translated: string; };
            altpage: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    biowares?: {
        bioware: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    blackmarketpipelinecategories?: {
        category: Many<{ _TEXT: string; $: { translate: string; translated?: string; }; }>;
    };
    books?: {
        book: Many<{
            $?: { translated: string; };
            altcode?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    categories?: {
        category: OneOrMany<{ _TEXT: string; $: { translate: string; translated?: string; type?: string; }; }>;
    };
    complexforms?: {
        complexform: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    contacts?: {
        contact: Many<{ _TEXT: string; $: { translate: string; translated?: string; }; }>;
    };
    cyberwares?: {
        cyberware: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            category?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            page?: { _TEXT: string; };
            source?: { _TEXT: string; };
            translate?: { _TEXT: string; };
        }>;
    };
    drainattributes?: {
        drainattribute: Many<{
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    drugcomponents?: {
        drugcomponent: Many<{
            $?: { translated: string; };
            altpage: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    drugs?: {
        drug: Many<{
            altpage: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    echoes?: {
        echo: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    enhancements?: {
        enhancement: Many<{
            $?: { translated: string; };
            altpage: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    gear?: Many<{
        id: { _TEXT: string; };
        name: { _TEXT: string; };
        translate?: { _TEXT: string; };
    }>;
    gears?: {
        gear: Many<{
            $?: { translated: string; };
            altpage?: Empty | { _TEXT: string; };
            category?: { _TEXT: string; };
            cost?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            source?: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    genders?: {
        gender: Many<{ _TEXT: string; $: { translate: string; }; }>;
    };
    grades?: {
        grade: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            page?: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    hobbiesvices?: {
        hobbyvice: Many<{ _TEXT: string; $: { translate: string; translated?: string; }; }>;
    };
    improvements?: {
        improvement: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            page?: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    knowledgeskills?: {
        skill: Many<{
            $?: { translated: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            specs?: Empty | {
                name?: { _TEXT: string; $: { translate: string; }; };
                spec?: OneOrMany<{ _TEXT: string; $: { translate: string; }; }>;
            };
            translate: { _TEXT: string; };
        }>;
    };
    licenses?: {
        license: Many<{ _TEXT: string; $: { translate: string; translated?: string; }; }>;
    };
    lifestyles?: {
        lifestyle: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    limbcounts?: {
        limb: Many<{
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    martialarts?: {
        martialart: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    mentors?: {
        mentor: Many<{
            $?: { translated: string; };
            altadvantage: { _TEXT: string; };
            altdisadvantage: { _TEXT: string; };
            altpage?: { _TEXT: string; };
            category?: { _TEXT: string; };
            choices?: {
                choice: Many<{
                    $?: { set: string; };
                    bonus?: {
                        selecttext: Empty;
                    };
                    name: Empty | { _TEXT: string; };
                    translate?: Empty | { _TEXT: string; };
                }>;
            };
            id: { _TEXT: string; };
            name: OneOrMany<{ _TEXT: string; }>;
            translate: OneOrMany<{ _TEXT: string; }>;
        }>;
    };
    metamagics?: {
        metamagic: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    metatypes?: {
        metatype: Many<{
            $?: { translated: string; };
            altpage?: Empty | { _TEXT: string; };
            id: { _TEXT: string; };
            metavariants?: Empty | {
                metavariant?: OneOrMany<{
                    altpage?: { _TEXT: string; };
                    id?: { _TEXT: string; };
                    name: { _TEXT: string; };
                    translate: { _TEXT: string; };
                }>;
            };
            name: { _TEXT: string; };
            translate: Empty | { _TEXT: string; };
        }>;
    };
    modcategories?: {
        category: Many<{ _TEXT: string; $: { translate: string; translated?: string; }; }>;
    };
    modifiers?: Empty;
    mods?: Empty | {
        mod?: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: Empty | { _TEXT: string; };
        }>;
    };
    packs?: {
        pack: Many<{
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    pdfarguments?: {
        pdfargument: Many<{
            $?: { translated: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    personallives?: {
        personallife: Many<{ _TEXT: string; $: { translate: string; translated?: string; }; }>;
    };
    powers?: {
        power: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id?: { _TEXT: string; };
            name: { _TEXT: string; };
            translate?: { _TEXT: string; };
        }>;
    };
    preferredpayments?: {
        preferredpayment: Many<{ _TEXT: string; $: { translate: string; translated?: string; }; }>;
    };
    priorities?: {
        priority: Many<{
            $?: { translated: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            talents?: {
                talent: Many<{
                    name: { _TEXT: string; };
                    translate: { _TEXT: string; };
                }>;
            };
            translate: { _TEXT: string; };
        }>;
    };
    prioritytables?: {
        prioritytable: Many<{ _TEXT: string; $: { translate: string; }; }>;
    };
    programs?: {
        program: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    qualities?: {
        lifestyle?: Many<{
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
        quality: Many<{
            $?: { translated: string; };
            altnameonpage?: Empty | { _TEXT: string; };
            altpage?: Empty | { _TEXT: string; };
            id?: { _TEXT: string; };
            karma?: { _TEXT: string; };
            name: { _TEXT: string; };
            page?: { _TEXT: string; };
            source?: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    ranges?: {
        range: Many<{
            $?: { translated: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    settings?: {
        setting: Many<{
            $?: { translated: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    sexes?: Empty;
    skillgroups?: {
        $?: { translated: string; };
        name: Many<{ _TEXT: string; $: { translate: string; }; }>;
    };
    skills?: {
        skill: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            specs?: Empty | {
                page?: { _TEXT: string; };
                spec?: OneOrMany<{ _TEXT: string; $: { translate: string; }; }>;
            };
            translate: { _TEXT: string; };
        }>;
    };
    spells?: {
        spell: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            source?: { _TEXT: string; };
            spell?: Many<{
                id: { _TEXT: string; };
                name: { _TEXT: string; };
                translate: { _TEXT: string; };
            }>;
            translate: { _TEXT: string; };
        }>;
    };
    spirits?: {
        spirit: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    techniques?: {
        technique: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            page?: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    tips?: {
        tip: Many<{
            $?: { translated: string; };
            id: { _TEXT: string; };
            text: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    traditions?: {
        tradition: OneOrMany<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            spirits?: {
                spirit: Many<{ _TEXT: string; $: { translate: string; }; }>;
            };
            translate: { _TEXT: string; };
        }>;
    };
    types?: {
        type: Many<{ _TEXT: string; $: { translate: string; }; }>;
    };
    vehicles?: {
        vehicle: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            avail?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            source?: { _TEXT: string; };
            translate: Empty | { _TEXT: string; };
        }>;
    };
    weaponmountcategories?: {
        category: { _TEXT: string; $: { translate: string; }; };
    };
    weaponmountmods?: {
        mod: Many<{
            altpage: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    weaponmounts?: {
        weaponmount: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
    weapons?: {
        weapon: Many<{
            $?: { translated: string; };
            altpage?: { _TEXT: string; };
            id: { _TEXT: string; };
            name: { _TEXT: string; };
            translate: { _TEXT: string; };
        }>;
    };
};

export interface LanguageSchema {
    languageFile: Many<Languagefile>;
    version: { _TEXT: string; };
};
