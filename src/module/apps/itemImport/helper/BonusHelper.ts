import { BonusSchema } from "../schema/BonusSchema";
import { ImportHelper as IH } from "./ImportHelper";
import { SR5ActiveEffect } from '../../../effect/SR5ActiveEffect'

import ShadowrunActorData = Shadowrun.ShadowrunActorData;
import ShadowrunItemData = Shadowrun.ShadowrunItemData;

import EffectTagsData = Shadowrun.EffectTagsData;
import EffectChangeData = Shadowrun.EffectChangeData;
import EffectOptionsData = Shadowrun.EffectOptionsData;
import EffectDurationData = Shadowrun.EffectDurationData;

type EffectChangeParameter = { key: string; value: string | number; mode?: number; priority?: number; }

const {
    CUSTOM,
    MULTIPLY,
    ADD,
    DOWNGRADE,
    UPGRADE,
    OVERRIDE,
} = CONST.ACTIVE_EFFECT_MODES;

type ShadowrunSheetData = (ShadowrunItemData | ShadowrunActorData) & { effects?: EffectOptionsData[] };

export class BonusHelper {
    private static cnt1 : number = 0;
    private static cnt2 : number = 0;

    private static isTrue(value: { _TEXT: string }): boolean { return value._TEXT === "True"; }

    private static normalizeValue(value: string | number): string | number {
        if (typeof value === 'number')
            return value;
        return value.replace("Rating", "(@system.rating)");
    }

    private static normalizeSkillName(rawName: string): string {
        let name = rawName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/-/g, '_');
    
        if (name.includes('exotic') && name.includes('_weapon')) {
            name = name.replace('_weapon', '');
        }
        if (name.includes('exotic') && name.includes('_ranged')) {
            name = name.replace('_ranged', '_range');
        }

        if (name === 'shadowing' || name === 'infiltration') {
            name = 'sneaking';
        }
        if (name === 'pilot_watercraft') {
            name = 'pilot_water_craft';
        }
        if (name === 'thrown_weapons') {
            name = 'throwing_weapons';
        }
    
        return name;
    }

    private static createEffect(
        overrides: EffectOptionsData,
        changes: EffectChangeParameter[],
        flags?: Partial<EffectTagsData>
    ): EffectOptionsData {
        const defaultEffect = {
            name: "Unnamed Effect",
            transfer: true,
        };

        const merged = {
            ...defaultEffect,
            ...overrides,
            changes: (changes ?? []).map(change  => ({
                key: change.key,
                value: this.normalizeValue(change.value),
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

        return merged;
    }

    public static addBonus(sheet: ShadowrunSheetData, bonus: BonusSchema) : void {
        sheet.effects = [];

        if (bonus.armor) {
            const armor = bonus.armor._TEXT;
            sheet.effects.push(this.createEffect(
                { name: "Add Armor", img: sheet.img },
                [{ key: "system.armor.mod", value: armor, mode:0, priority:0 }],
            ));
        }

        // TODO - threshold, sharedthresholdoffset, thresholdoffset
        if (bonus.conditionmonitor) {
            const cm  = bonus.conditionmonitor;

            if (cm.overflow) {
                sheet.effects.push(this.createEffect(
                    { name: "Override Physical Overflow Track", img: sheet.img },
                    [{ key: "system.modifiers.physical_overflow_track", value: cm.overflow._TEXT, mode: OVERRIDE }],
                ));
            }

            if (cm.physical) {
                sheet.effects.push(this.createEffect(
                    { name: "Override Physical Track", img: sheet.img },
                    [{ key: "system.modifiers.physical_track", value: cm.physical._TEXT, mode: OVERRIDE }],
                ));
            }

            if (cm.stun) {
                sheet.effects.push(this.createEffect(
                    { name: "Override Stun Track", img: sheet.img },
                    [{ key: "system.modifiers.stun_track", value: cm.stun._TEXT, mode: OVERRIDE }],
                ));
            }
        }

        if (bonus.initiative) {
            sheet.effects.push(this.createEffect(
                { name: "Increase Initiative", img: sheet.img },
                [{ key: "system.modifiers.initiative_dice", value: bonus.initiative._TEXT }]
            ));
        }

        if (bonus.initiativedice) {
            sheet.effects.push(this.createEffect(
                { name: "Increase Initiative Dice", img: sheet.img },
                [{ key: "system.modifiers.initiative_dice", value: bonus.initiativedice._TEXT }]
            ));
        }

        if (bonus.limitmodifier) {
            for (const limitModifier of IH.getArray(bonus.limitmodifier)) {
                const name = limitModifier.limit._TEXT;
                const normalName = name.replace(' ', "_").toLowerCase();
                const conditionTag = limitModifier.condition ? "*" : "";

                sheet.effects.push(this.createEffect(
                    { name: sheet.name + conditionTag, img: sheet.img },
                    [{ key: "data.limit.mod", value: limitModifier.value._TEXT }],
                    { applyTo: 'test_all', selection_limits: `[{\"value\":\"${name}\",\"id\":\"${normalName}\"}]`} 
                ));
            }
        }
        
        if (bonus.matrixinitiative) {
            sheet.effects.push(this.createEffect(
                { name: "Increase Matrix Initiative", img: sheet.img },
                [{ key: "system.modifiers.matrix_initiative", value: bonus.matrixinitiative._TEXT }]
            ));
        }

        //TODO if (bonus.matrixinitiativedice)
        
        if (bonus.matrixinitiativediceadd) {
            sheet.effects.push(this.createEffect(
                { name: "Increase Matrix Initiative Dice", img: sheet.img },
                [{ key: "system.modifiers.matrix_initiative_dice", value: bonus.matrixinitiativediceadd._TEXT }]
            ));
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

                sheet.effects.push(this.createEffect(
                    { name: sheet.name + conditionTag, img: sheet.img },
                    [{ key: "data.modifiers.mod", value: skill.bonus._TEXT }],
                    { applyTo: 'test_all', selection_attributes: `[{\"value\":\"${name.capitalize()}\",\"id\":\"${name}\"}]`}
                ));
            }
        }

        if (bonus.skillcategory) {
            const skillCategoryTable: Record<string, string[]> = {
                "Combat Active": ["archery", "automatics", "blades", "clubs", "exotic_melee", "exotic_range", "heavy_weapons", "longarms", "pistols", "throwing_weapons", "unarmed_combat"],
                "Physical Active": ["disguise", "diving", "escape_artist", "flight", "free_fall", "gymnastics", "palming", "perception", "running", "sneaking", "survival", "swimming", "tracking"],
                "Social Active": ["con", "etiquette", "impersonation", "instruction", "intimidation", "leadership", "negotiation", "performance"],
                "Magical Active": ["alchemy", "artificing", "assensing", "astral_combat", "banishing", "binding", "counterspelling", "disenchanting", "ritual_spellcasting", "spellcasting", "summoning"],
                "Pseudo-Magical Active": ["arcana"],
                "Resonance Active": ["compiling", "decompiling", "registering"],
                "Technical Active": ["aeronautics_mechanic", "animal_handling", "armorer", "artisan", "automotive_mechanic", "biotechnology", "chemistry", "computer", "cybercombat", "cybertechnology",
                    "demolitions", "electronic_warfare", "first_aid", "forgery", "hacking", "hardware", "industrial_mechanic", "locksmith", "medicine", "nautical_mechanic", "navigation", "software"],
                "Vehicle Active": ["pilot_exotic_vehicle", "gunnery", "pilot_aerospace", "pilot_aircraft", "pilot_ground_craft", "pilot_walker", "pilot_water_craft"],
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

                sheet.effects.push(this.createEffect(
                    { name: sheet.name + conditionTag, img: sheet.img },
                    [{ key: "data.modifiers.mod", value: skillCategory.bonus._TEXT }],
                    {
                        applyTo: 'test_all',
                        selection_skills: JSON.stringify(skills)
                    }
                ));
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

                sheet.effects.push(this.createEffect(
                    { name: sheet.name + conditionTag, img: sheet.img },
                    [{ key: "data.modifiers.mod", value: skillGroup.bonus._TEXT }],
                    {
                        applyTo: 'test_all',
                        selection_skills: JSON.stringify(skills)
                    }
                ));
            }
        }

        //TODO condition & applytoRating
        if (bonus.specificskill) {
            for (const skill of IH.getArray(bonus.specificskill)) {
                const name = skill.name._TEXT;
                const normalName = this.normalizeSkillName(name);
                const conditionTag = skill.condition ? "*" : "";

                sheet.effects.push(this.createEffect(
                    { name: sheet.name + conditionTag, img: sheet.img },
                    [{ key: "data.modifiers.mod", value: skill.bonus._TEXT }],
                    { applyTo: 'test_all', selection_skills: `[{\"value\":\"${name}\",\"id\":\"${normalName}\"}]`}
                ));
            }
        }

        if (bonus.spellresistance) {
            sheet.effects.push(this.createEffect(
                { name: sheet.name, img: sheet.img },
                [{ key: "data.modifiers.mod", value: bonus.spellresistance._TEXT }],
                { applyTo: 'test_all', selection_tests: '[{"value":"Combat Spell Defense","id":"CombatSpellDefenseTest"}]' }
            ));
        }

        if (sheet.effects.length) {
            // console.log(sheet.name, sheet.effects);
            this.cnt1++;
            this.cnt2 += sheet.effects.length;
            console.log(this.cnt1, this.cnt2);
        }
    }
}
