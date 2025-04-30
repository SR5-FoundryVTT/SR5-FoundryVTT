import { BonusSchema } from "../schema/BonusSchema";
import { ImportHelper as IH } from "./ImportHelper";
import { SR5ActiveEffect } from '../../../effect/SR5ActiveEffect'
import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';

import ShadowrunActorData = Shadowrun.ShadowrunActorData;
import ShadowrunItemData = Shadowrun.ShadowrunItemData;

import EffectTagsData = Shadowrun.EffectTagsData;
import EffectChangeData = Shadowrun.EffectChangeData;
import EffectOptionsData = Shadowrun.EffectOptionsData;
import EffectDurationData = Shadowrun.EffectDurationData;
import { SR5Item } from "../../../item/SR5Item";

type EffectChangeParameter = { key: string; value: string | number; mode?: number; priority?: number; }

const {
    CUSTOM,
    MULTIPLY,
    ADD,
    DOWNGRADE,
    UPGRADE,
    OVERRIDE,
} = CONST.ACTIVE_EFFECT_MODES;

type ShadowrunSheetData = (
    ShadowrunItemData | ShadowrunActorData
) & {
    effects?: EffectOptionsData[];
    flags?: { shadowrun5e: { embeddedItems: ItemDataSource[] } };
};

export class BonusHelper {
    private static cnt1 : number = 0;
    private static cnt2 : number = 0;

    private static isTrue(value: { _TEXT: string }): boolean { return value._TEXT === "True"; }

    private static normalizeValue(sheet: any, value: string | number): string | number {
        if (typeof value === 'number')
            return value;

        if (value.includes("Rating")) {
            let path = "";

            if ('rating' in sheet.system) path = "(@system.rating)";
            else if ('rating' in sheet.system?.technology) path = "(@system.technology.rating)"

            if (!path)
                console.log("Didn't find rating on Item: " + sheet.name);

            value = value.replace("Rating", path);
        }

        return value;
    }

    private static normalizeSkillName(rawName: string): string {
        return rawName.toLowerCase().trim().replace(/\s+/g, '_').replace(/-/g, '_');
    }

    private static createEffect(
        sheet: ShadowrunSheetData,
        overrides: Partial<EffectOptionsData>,
        changes: EffectChangeParameter[],
        flags?: Partial<EffectTagsData>
    ): void {
        const defaultEffect = {
            name: sheet.name,
            img: sheet.img,
            transfer: true,
        };

        const effect = {
            ...defaultEffect,
            ...overrides,
            changes: (changes ?? []).map(change  => ({
                key: change.key,
                value: this.normalizeValue(sheet, change.value),
                mode: change.mode ?? CUSTOM,
                priority: change.priority ?? change.mode ?? 0
            })),
            ...(flags && {
                flags: {
                    shadowrun5e: {
                        applyTo: 'actor' as Shadowrun.EffectApplyTo,
                        ...flags,
                    },
                },
            }),
        };

        sheet.effects?.push(effect);
    }

    public static addBonus(sheet: ShadowrunSheetData, bonus: BonusSchema) : void {
        this.addEffects(sheet, bonus);
        this.addItems(sheet, bonus);
    }

    private static addEffects(sheet: ShadowrunSheetData, bonus: BonusSchema) : void {
        sheet.effects ??= [];

        if (bonus.armor) {
            this.createEffect(
                sheet, { name: "Add Armor" },
                [{ key: "system.armor.mod", value: bonus.armor._TEXT }],
            );
        }

        // TODO - threshold, sharedthresholdoffset, thresholdoffset
        if (bonus.conditionmonitor) {
            const cm  = bonus.conditionmonitor;

            if (cm.overflow) {
                this.createEffect(
                    sheet, { name: "Override Physical Overflow Track"},
                    [{ key: "system.modifiers.physical_overflow_track", value: cm.overflow._TEXT, mode: OVERRIDE }],
                );
            }

            if (cm.physical) {
                this.createEffect(
                    sheet, { name: "Override Physical Track" },
                    [{ key: "system.modifiers.physical_track", value: cm.physical._TEXT, mode: OVERRIDE }],
                );
            }

            if (cm.stun) {
                this.createEffect(
                    sheet, { name: "Override Stun Track" },
                    [{ key: "system.modifiers.stun_track", value: cm.stun._TEXT, mode: OVERRIDE }],
                );
            }
        }

        if (bonus.initiative) {
            this.createEffect(
                sheet, { name: "Increase Initiative" },
                [{ key: "system.modifiers.initiative_dice", value: bonus.initiative._TEXT }]
            );
        }

        if (bonus.initiativedice) {
            this.createEffect(
                sheet, { name: "Increase Initiative Dice" },
                [{ key: "system.modifiers.initiative_dice", value: bonus.initiativedice._TEXT }]
            );
        }

        if (bonus.limitmodifier) {
            for (const limitModifier of IH.getArray(bonus.limitmodifier)) {
                const name = limitModifier.limit._TEXT;
                const normalName = name.replace(' ', "_").toLowerCase();
                const conditionTag = limitModifier.condition ? "*" : "";

                this.createEffect(
                    sheet, { name: sheet.name + conditionTag },
                    [{ key: "data.limit.mod", value: limitModifier.value._TEXT }],
                    { applyTo: 'test_all', selection_limits: `[{\"value\":\"${name}\",\"id\":\"${normalName}\"}]`} 
                );
            }
        }
        
        if (bonus.matrixinitiative) {
            this.createEffect(
                sheet, { name: "Increase Matrix Initiative" },
                [{ key: "system.modifiers.matrix_initiative", value: bonus.matrixinitiative._TEXT }]
            );
        }

        //TODO if (bonus.matrixinitiativedice)
        
        if (bonus.matrixinitiativediceadd) {
            this.createEffect(
                sheet, { name: "Increase Matrix Initiative Dice" },
                [{ key: "system.modifiers.matrix_initiative_dice", value: bonus.matrixinitiativediceadd._TEXT }]
            );
        }

        //TODO <critterpowerlevels>. Quite tricky. Needs other power that was not initialized

        //TODO Precedent
        if (bonus.skillattribute) {
            for (const skill of IH.getArray(bonus.skillattribute)) {
                const attributeTable: Record<string, string> = {
                    "STR": "strength", "DEX": "dexterity", "AGI": "agility",
                    "REA": "reaction", "WIL": "willpower", "LOG": "logic",
                    "INT": "intuition", "CHA": "charisma", "EDG": "edge",
                    "MAG": "magic", "RES": "ressonance", "ESS": "essence"
                };

                const name = attributeTable[skill.name._TEXT];
                const conditionTag = skill.condition ? "*" : "";

                this.createEffect(
                    sheet, { name: sheet.name + conditionTag },
                    [{ key: "data.modifiers.mod", value: skill.bonus._TEXT }],
                    { applyTo: 'test_all', selection_attributes: `[{\"value\":\"${name.capitalize()}\",\"id\":\"${name}\"}]`}
                );
            }
        }

        if (bonus.skillcategory) {
            const skillCategoryTable: Record<string, string[]> = {
                "Combat Active": ["archery", "automatics", "blades", "clubs", "exotic_melee_weapon", "exotic_ranged_weapon", "heavy_weapons", "longarms", "pistols", "throwing_weapons", "unarmed_combat"],
                "Physical Active": ["disguise", "diving", "escape_artist", "flight", "free_fall", "gymnastics", "palming", "perception", "running", "sneaking", "survival", "swimming", "tracking"],
                "Social Active": ["con", "etiquette", "impersonation", "instruction", "intimidation", "leadership", "negotiation", "performance"],
                "Magical Active": ["alchemy", "artificing", "assensing", "astral_combat", "banishing", "binding", "counterspelling", "disenchanting", "ritual_spellcasting", "spellcasting", "summoning"],
                "Pseudo-Magical Active": ["arcana"],
                "Resonance Active": ["compiling", "decompiling", "registering"],
                "Technical Active": ["aeronautics_mechanic", "animal_handling", "armorer", "artisan", "automotive_mechanic", "biotechnology", "chemistry", "computer", "cybercombat", "cybertechnology",
                    "demolitions", "electronic_warfare", "first_aid", "forgery", "hacking", "hardware", "industrial_mechanic", "locksmith", "medicine", "nautical_mechanic", "navigation", "software"],
                "Vehicle Active": ["pilot_exotic_vehicle", "gunnery", "pilot_aerospace", "pilot_aircraft", "pilot_ground_craft", "pilot_walker", "pilot_watercraft"],
                //TODO knowledge skill category
                "Academic": [],
                "Interest": [],
                "Language": [],
                "Professional": [],
                "Street": [],
            };

            for (const skillCategory of IH.getArray(bonus.skillgroup)) {
                const conditionTag = skillCategory.condition ? "*" : "";
                const excludedSkill = this.normalizeSkillName(skillCategory.exclude?._TEXT ?? "");
                
                const skills = skillCategoryTable[skillCategory.name._TEXT]
                                .filter(skillId => !excludedSkill || skillId !== excludedSkill)
                                .map(skillId => ({ value: skillId.replace("_", " ").capitalize(), id: skillId }))

                // TODO remove
                if (!skills || !skills.length)
                    console.log("Error skillgroup: ", skillCategory.name._TEXT);

                this.createEffect(
                    sheet, { name: sheet.name + conditionTag },
                    [{ key: "data.modifiers.mod", value: skillCategory.bonus._TEXT }],
                    { applyTo: 'test_all', selection_skills: JSON.stringify(skills) }
                );
            }
        }

        //
        if (bonus.skillgroup) {
            const skillGroupTable: Record<string, string[]> = {
                "Acting": ["con", "impersonation", "performance"],
                "Athletics": ["gymnastics", "running", "swimming", "flight"],
                "Biotech": ["cybertechnology", "first_aid", "medicine"],
                "Close Combat": ["blades", "clubs", "unarmed_combat"],
                "Conjuring": ["banishing", "binding", "summoning"],
                "Cracking": ["cybercombat", "electronic_warfare", "hacking"],
                "Electronics": ["computer", "hardware", "software"],
                "Enchanting": ["alchemy", "artificing", "disenchanting"],
                "Firearms": ["automatics", "longarms", "pistols"],
                "Influence": ["etiquette", "leadership", "negotiation"],
                "Engineering": ["aeronautics_mechanic", "automotive_mechanic", "industrial_mechanic", "nautical_mechanic"],
                "Outdoors": ["navigation", "survival", "tracking"],
                "Sorcery": ["counterspelling", "ritual_spellcasting", "spellcasting"],
                "Stealth": ["disguise", "palming", "sneaking"],
                "Tasking": ["compiling", "decompiling", "registering"],
            };

            for (const skillGroup of IH.getArray(bonus.skillgroup)) {
                const conditionTag = skillGroup.condition ? "*" : "";
                const excludedSkill = this.normalizeSkillName(skillGroup.exclude?._TEXT ?? "");
                
                const skills = skillGroupTable[skillGroup.name._TEXT]
                                .filter(skillId => !excludedSkill || skillId !== excludedSkill)
                                .map(skillId => ({ value: skillId.replace("_", " ").capitalize(), id: skillId }))
                
                //TODO Remove
                if (!skills || !skills.length)
                    console.log("Error skillgroup: ", skillGroup.name._TEXT);

                this.createEffect(
                    sheet, { name: sheet.name + conditionTag },
                    [{ key: "data.modifiers.mod", value: skillGroup.bonus._TEXT }],
                    { applyTo: 'test_all', selection_skills: JSON.stringify(skills) }
                );
            }
        }

        //TODO condition & applytoRating
        if (bonus.specificskill) {
            for (const skill of IH.getArray(bonus.specificskill)) {
                const name = skill.name._TEXT;
                const normalName = this.normalizeSkillName(name);
                const conditionTag = skill.condition ? "*" : "";

                this.createEffect(
                    sheet, { name: sheet.name + conditionTag },
                    [{ key: "data.modifiers.mod", value: skill.bonus._TEXT }],
                    { applyTo: 'test_all', selection_skills: `[{\"value\":\"${name}\",\"id\":\"${normalName}\"}]`}
                );
            }
        }

        if (bonus.spellresistance) {
            this.createEffect(
                sheet, {},
                [{ key: "data.modifiers.mod", value: bonus.spellresistance._TEXT }],
                { applyTo: 'test_all', selection_tests: '[{"value":"Combat Spell Defense","id":"CombatSpellDefenseTest"}]' }
            );
        }

        if (sheet.effects.length) {
            // console.log(sheet.name, sheet.effects);
            this.cnt1++;
            this.cnt2 += sheet.effects.length;
            console.log(this.cnt1, this.cnt2);
        }
    }

    private static addItems(sheet: ShadowrunSheetData, bonus: BonusSchema) : void {
        sheet.flags ??= { shadowrun5e: { embeddedItems: [] } };

        if (bonus.addgear) {
            const name = bonus.addgear.name._TEXT;
            const foundItem = IH.findItem(name);
    
            if (foundItem) {
                const itemBase = foundItem.toObject();

                if (bonus.addgear.rating?._TEXT) {
                    const rating = +bonus.addgear.rating._TEXT;

                    if ('rating' in itemBase.system) {
                        itemBase.system.rating = rating;
                    } else if ('technology' in itemBase.system) {
                        itemBase.system.technology.rating = rating;
                    }
                }

                sheet.flags.shadowrun5e.embeddedItems.push(itemBase);
            } else {
                console.log(`[Gear Missing (Bonus)]\nSheet: ${sheet.name}\nMod: ${name}`);
            }
        }

        if (bonus.addqualities) {
            for (const quality of IH.getArray(bonus.addqualities.addquality)) {
                const name = quality._TEXT;
                
                if (!name) continue;
                const foundItem = IH.findItem(name);

                if (!foundItem) {
                    console.log(`[Quality Missing (Bonus)]\nSheet: ${sheet.name}\nMod: ${name}`);
                    continue;
                }

                const itemBase = foundItem.toObject();

                if (quality.$?.select)
                    itemBase.name += ` (${quality.$.select})`
    
                if (quality.$?.rating && 'rating' in itemBase.system)
                    itemBase.system.rating = +quality.$?.rating;

                sheet.flags.shadowrun5e.embeddedItems.push(itemBase);
            }
        }

        if (bonus.addspell) {
            const name = bonus.addspell._TEXT;
            const foundItem = IH.findItem(name);
    
            if (foundItem) {
                sheet.flags.shadowrun5e.embeddedItems.push(foundItem.toObject());
            } else {
                console.log(`[Spell Missing (Bonus)]\nSheet: ${sheet.name}\nMod: ${name}`);
            }
        }

    }
}
