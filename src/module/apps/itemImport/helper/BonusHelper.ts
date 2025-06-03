import { BonusSchema } from "../schema/BonusSchema";
import { ImportHelper as IH } from "./ImportHelper";
import * as BC from "./BonusConstant";

import EffectTagsData = Shadowrun.EffectTagsData;
import EffectChangeData = Shadowrun.EffectChangeData;
import EffectOptionsData = Shadowrun.EffectOptionsData;
import EffectDurationData = Shadowrun.EffectDurationData;
import { SystemActor } from "src/module/actor/SR5Actor";
import { SystemItem } from "src/module/item/SR5Item";

export class BonusHelper {
    private static isTrue(value: "" | { _TEXT: string }): boolean {
        return value === "" || value._TEXT === "True";
    }

    private static normalizeValue(sheet: BC.CreateData, value: string | number): string | number {
        if (typeof value === 'number')
            return value;

        if (value.includes("Rating")) {
            let path = "";

            const system = sheet.system as Actor.SystemOfType<SystemActor> | Item.SystemOfType<SystemItem>;

            if ('rating' in system)
                path = "(@system.rating)";
            else if ('technology' in system && system.technology && 'rating' in system.technology)
                path = "(@system.technology.rating)";
            else if ('level' in system)
                path = "(@system.level)";

            if (!path)
                console.error("Didn't find rating on Item: " + sheet.name);

            value = value.replace("Rating", path);
        }

        return value;
    }

    private static normalizeSkillName(rawName: string): string {
        let name = rawName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/-/g, '_');
    
        if (name.includes('exotic') && name.includes('_weapon'))
            name = name.replace('_weapon', '');
        if (name.includes('exotic') && name.includes('_ranged'))
            name = name.replace('_ranged', '_range');

        if (name === 'pilot_watercraft')
            name = 'pilot_water_craft';

        return name;
    }

    private static createEffect(
        sheet: BC.CreateData,
        overrides: Partial<EffectOptionsData>,
        changes: BC.EffectChangeParameter[],
        flags?: Partial<EffectTagsData>
    ): void {
        const defaultEffect = {
            name: sheet.name as string,
            img: sheet.img as string,
            transfer: true,
        };

        const effect = {
            ...defaultEffect,
            ...overrides,
            changes: changes.map(change  => ({
                key: change.key as string,
                value: this.normalizeValue(sheet, change.value),
                mode: change.mode ?? BC.CUSTOM,
                priority: change.priority ?? change.mode ?? 0
            })),
            ...(flags && {
                flags: {
                    shadowrun5e: {
                        applyTo: 'test_all' as Shadowrun.EffectApplyTo,
                        ...flags,
                    },
                },
            }),
        };

        sheet.effects?.push(effect);
    }

    public static async addBonus(sheet: BC.CreateData, bonus: BonusSchema) : Promise<void> {
        await this.addEffects(sheet, bonus);
    }

    private static async addEffects(sheet: BC.CreateData, bonus: BonusSchema) : Promise<void> {
        sheet.effects ??= [];

        for (const [key, effect] of Object.entries(BC.BonusConstant.simpleEffects)) {
            if (bonus[key]) {
                const value = bonus[key]._TEXT as string;
                const { overrides, tags, ...change } = effect;
                this.createEffect( sheet, overrides || {}, [{ ...change, value: value }], tags);
            }
        }

        if (bonus.conditionmonitor) {
            const cm  = bonus.conditionmonitor;

            if (cm.overflow) {
                this.createEffect(
                    sheet, { name: "Override Physical Overflow Track"},
                    [{ key: "system.modifiers.physical_overflow_track", value: cm.overflow._TEXT, mode: BC.OVERRIDE }],
                );
            }

            if (cm.physical) {
                this.createEffect(
                    sheet, { name: "Override Physical Track" },
                    [{ key: "system.modifiers.physical_track", value: cm.physical._TEXT, mode: BC.OVERRIDE }],
                );
            }

            if (cm.stun) {
                this.createEffect(
                    sheet, { name: "Override Stun Track" },
                    [{ key: "system.modifiers.stun_track", value: cm.stun._TEXT, mode: BC.OVERRIDE }],
                );
            }
        }

        if (bonus.limitmodifier) {
            for (const limitModifier of IH.getArray(bonus.limitmodifier)) {
                const name = limitModifier.limit._TEXT;
                const normalName = name.replace(' ', "_").toLowerCase();
                const conditionTag = limitModifier.condition ? "*" : "";

                this.createEffect(
                    sheet, { name: sheet.name + conditionTag },
                    [{ key: "data.limit.mod", value: limitModifier.value._TEXT }],
                    { selection_limits: `[{\"value\":\"${name}\",\"id\":\"${normalName}\"}]`} 
                );
            }
        }

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
                    { selection_attributes: `[{\"value\":\"${name.capitalize()}\",\"id\":\"${name}\"}]`}
                );
            }
        }

        if (bonus.skillcategory) {
            for (const skillCategory of IH.getArray(bonus.skillcategory)) {
                const conditionTag = skillCategory.condition ? "*" : "";
                const excludedSkill = this.normalizeSkillName(skillCategory.exclude?._TEXT ?? "");
                
                const skills = BC.BonusConstant.skillCategoryTable[skillCategory.name._TEXT]
                                .filter(skillId => !excludedSkill || skillId !== excludedSkill)
                                .map(skillId => ({ value: skillId.replace("_", " ").capitalize(), id: skillId }))

                if (!skills || !skills.length)
                    console.log("Error skillcategory:", skillCategory.name._TEXT);
                else
                    this.createEffect(
                        sheet, { name: sheet.name + conditionTag },
                        [{ key: "data.modifiers.mod", value: skillCategory.bonus._TEXT }],
                        { selection_skills: JSON.stringify(skills) }
                    );
            }
        }

        if (bonus.skillgroup) {
            for (const skillGroup of IH.getArray(bonus.skillgroup)) {
                const conditionTag = skillGroup.condition ? "*" : "";
                const excludedSkill = this.normalizeSkillName(skillGroup.exclude?._TEXT ?? "");

                const skills = BC.BonusConstant.skillGroupTable[skillGroup.name._TEXT]
                                .filter(skillId => !excludedSkill || skillId !== excludedSkill)
                                .map(skillId => ({ value: skillId.replace("_", " ").capitalize(), id: skillId }))

                this.createEffect(
                    sheet, { name: sheet.name + conditionTag },
                    [{ key: "data.modifiers.mod", value: skillGroup.bonus._TEXT }],
                    { selection_skills: JSON.stringify(skills) }
                );
            }
        }

        if (bonus.specificskill) {
            for (const skill of IH.getArray(bonus.specificskill)) {
                const name = skill.name._TEXT;
                const normalName = this.normalizeSkillName(name);
                const conditionTag = skill.condition ? "*" : "";

                this.createEffect(
                    sheet, { name: sheet.name + conditionTag },
                    [{ key: "data.modifiers.mod", value: skill.bonus._TEXT }],
                    { selection_skills: `[{\"value\":\"${name}\",\"id\":\"${normalName}\"}]`}
                );
            }
        }
    }
}
