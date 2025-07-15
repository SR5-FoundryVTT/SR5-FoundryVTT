import { BonusSchema } from "../schema/BonusSchema";
import { ImportHelper as IH } from "./ImportHelper";
import * as BC from "./BonusConstant";
import { DeepPartial } from "fvtt-types/utils";

export class BonusHelper {
    private static isTrue(value: "" | { _TEXT: string }): boolean {
        return value === "" || value._TEXT === "True";
    }

    private static normalizeValue(sheet: BC.DocCreateData, value: string | number): string {
        if (typeof value === 'number')
            return value.toString();

        if (value.includes("Rating")) {
            let path = "";

            const system = sheet.system!;

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
        sheet: BC.DocCreateData,
        effect: BC.AECreateData
    ): void {
        const changes = IH.getArray(effect.changes);

        for (const change of changes)
            change.value = this.normalizeValue(sheet, change.value);

        sheet.effects!.push({
            name: sheet.name,
            img: sheet.img,
            ...effect,
        });
    }

    public static async addBonus(sheet: BC.DocCreateData, bonus: BonusSchema) : Promise<void> {
        await this.addEffects(sheet, bonus);
    }

    private static async addEffects(sheet: BC.DocCreateData, bonus: BonusSchema) : Promise<void> {
        sheet.effects ??= [];

        for (const [key, data] of Object.entries(bonus)) {
            const baseEffect = BC.BonusConstant.simpleEffects[key] as BC.AECreateData | undefined;
            if (baseEffect) {
                const applyEffect = foundry.utils.deepClone(baseEffect);
                for (const change of applyEffect.changes ?? [])
                    change.value = data._TEXT as string;
                this.createEffect(sheet, applyEffect);
            }
        }

        if (bonus.conditionmonitor) {
            const cm = bonus.conditionmonitor;

            if (cm.overflow) {
                this.createEffect(
                    sheet, { 
                        name: "Override Physical Overflow Track",
                        changes: [{ key: "system.modifiers.physical_overflow_track", value: cm.overflow._TEXT, mode: BC.OVERRIDE }]
                    },
                );
            }

            if (cm.physical) {
                this.createEffect(
                    sheet, {
                        name: "Override Physical Track",
                        changes: [{ key: "system.modifiers.physical_track", value: cm.physical._TEXT, mode: BC.OVERRIDE }]
                    },
                );
            }

            if (cm.stun) {
                this.createEffect(
                    sheet, {
                        name: "Override Stun Track",
                        changes: [{ key: "system.modifiers.stun_track", value: cm.stun._TEXT, mode: BC.OVERRIDE }]
                    }
                );
            }

            if (cm.threshold) {
                this.createEffect(
                    sheet, {
                        name: "Pain Tolerance",
                        changes: [{ key: "system.modifiers.wound_tolerance", value: cm.threshold._TEXT }]
                    },
                );
            }

            if (cm.thresholdoffset) {
                this.createEffect(
                    sheet, {
                        name: "High Pain Tolerance",
                        changes: [{ key: "system.modifiers.pain_tolerance_physical", value: cm.thresholdoffset._TEXT }]
                    }
                );
            }

            if (cm.sharedthresholdoffset) {
                this.createEffect(
                    sheet, {
                        name: "Shared Tolerance",
                        changes: [
                            { key: "system.modifiers.pain_tolerance_physical", value: cm.sharedthresholdoffset._TEXT },
                            { key: "system.modifiers.stun_tolerance_physical", value: cm.sharedthresholdoffset._TEXT },
                        ]
                    }
                );
            }
        }

        if (bonus.limitmodifier) {
            for (const limitModifier of IH.getArray(bonus.limitmodifier)) {
                const name = limitModifier.limit._TEXT;
                const normalName = name.replace(' ', "_").toLowerCase();
                const conditionTag = limitModifier.condition ? "*" : "";

                this.createEffect(
                    sheet, {
                        name: sheet.name + conditionTag,
                        changes: [{ key: "data.limit.mod", value: limitModifier.value._TEXT }],
                        system: { applyTo: 'test_all', selection_limits: [{ id: normalName }] }
                    }
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
                    sheet, {
                        name: sheet.name + conditionTag,
                        changes: [{ key: "data.modifiers.mod", value: skill.bonus._TEXT }],
                        system: { applyTo: 'test_all', selection_attributes: [{ id: name }] }
                    }
                );
            }
        }

        if (bonus.skillcategory) {
            for (const skillCategory of IH.getArray(bonus.skillcategory)) {
                const conditionTag = skillCategory.condition ? "*" : "";
                const excludedSkill = this.normalizeSkillName(skillCategory.exclude?._TEXT ?? "");
                
                const skills = BC.BonusConstant.skillCategoryTable[skillCategory.name._TEXT]
                                .filter(skillId => !excludedSkill || skillId !== excludedSkill)
                                .map(skillId => ({ id: skillId }))

                if (!skills?.length)
                    console.log("Error skillcategory:", skillCategory.name._TEXT);
                else
                    this.createEffect(
                        sheet, {
                            name: sheet.name + conditionTag,
                            changes: [{ key: "data.modifiers.mod", value: skillCategory.bonus._TEXT }],
                            system: { applyTo: 'test_all', selection_skills: skills }
                        }
                    );
            }
        }

        if (bonus.skillgroup) {
            for (const skillGroup of IH.getArray(bonus.skillgroup)) {
                const conditionTag = skillGroup.condition ? "*" : "";
                const excludedSkill = this.normalizeSkillName(skillGroup.exclude?._TEXT ?? "");

                const skills = BC.BonusConstant.skillGroupTable[skillGroup.name._TEXT]
                                .filter(skillId => !excludedSkill || skillId !== excludedSkill)
                                .map(skillId => ({ id: skillId }))

                this.createEffect(
                    sheet, {
                        name: sheet.name + conditionTag,
                        changes: [{ key: "data.modifiers.mod", value: skillGroup.bonus._TEXT }],
                        system: { applyTo: 'test_all', selection_skills: skills }
                    }
                );
            }
        }

        if (bonus.specificskill) {
            for (const skill of IH.getArray(bonus.specificskill)) {
                const name = skill.name._TEXT;
                const normalName = this.normalizeSkillName(name);
                const conditionTag = skill.condition ? "*" : "";

                this.createEffect(
                    sheet, {
                        name: sheet.name + conditionTag,
                        changes: [{ key: "data.modifiers.mod", value: skill.bonus._TEXT }],
                        system: { applyTo: 'test_all', selection_skills: [{ id: normalName }] }
                    }
                );
            }
        }
    }
}
