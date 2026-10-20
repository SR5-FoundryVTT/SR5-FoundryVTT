import * as BC from "./BonusConstant";
import { Constants } from "../importer/Constants";
import { BonusSchema } from "../schema/BonusSchema";
import { ImportHelper as IH } from "./ImportHelper";
import { SkillNamingFlow } from "@/module/flows/SkillNamingFlow";
import { ChummerImportCoverage } from './ChummerImportCoverage';

export class BonusHelper {
    /** Chummer bonus keys that addEffects turns into effects. */
    private static readonly handledBonuses = new Set<string>([
        ...Object.keys(BC.BonusConstant.simpleEffects),
        'conditionmonitor', 'essencepenaltyt100', 'limitmodifier', 'runmultiplier', 'skillattribute',
        'skillcategory', 'skillgroup', 'specificattribute', 'specificskill', 'spellcategory',
        'unarmedap', 'unarmeddv', 'walkmultiplier',
    ]);

    /** Chummer spell categories and the test category Foundry gives spellcasting tests of that category. */
    private static readonly spellCategories: Record<string, string> = {
        Combat: 'spell_combat',
        Detection: 'spell_detection',
        Health: 'spell_healing',
        Illusion: 'spell_illusion',
        Manipulation: 'spell_manipulation',
    };

    /** Chummer's base ground movement multipliers, which a percent bonus scales. */
    private static readonly movementRates = { walk: 2, run: 4 } as const;

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

        value = value.replace(/\bdiv\b/g, '/');

        // Chummer's {MAG}, {BOD}... read the owning character's attribute.
        value = value.replace(/\{([A-Z]{3})\}/g, (match, attribute: string) => {
            const key = Constants.attributeTable[attribute as keyof typeof Constants.attributeTable];
            return key ? `(@actor.system.attributes.${key}.value)` : match;
        });

        return value;
    }

    private static normalizeSkillName(rawName: string): string {
        return SkillNamingFlow.nameToKey(rawName);
    }

    private static mergeCondition(target: BC.AETargetData, condition: BC.AEFilterConditionData): boolean {
        target.conditions ??= [];

        const incomingMode = condition.mode ?? 'include';
        const incomingValues = [...new Set(condition.values)];
        const existing = target.conditions.find(existing => existing.type === condition.type);

        if (!existing) {
            target.conditions.push({ ...condition, mode: incomingMode, values: incomingValues });
            return true;
        }

        existing.mode ??= 'include';
        existing.values = [...new Set(existing.values)];

        if (existing.mode === 'include' && incomingMode === 'include') {
            const intersection = existing.values.filter(value => incomingValues.includes(value));
            if (!intersection.length) return false;
            existing.values = intersection;
            return true;
        }

        if (existing.mode === 'exclude' && incomingMode === 'exclude') {
            existing.values = [...new Set([...existing.values, ...incomingValues])];
            return true;
        }

        if (existing.mode === 'include' && incomingMode === 'exclude') {
            const filtered = existing.values.filter(value => !incomingValues.includes(value));
            if (!filtered.length) return false;
            existing.values = filtered;
            return true;
        }

        if (existing.mode === 'exclude' && incomingMode === 'include') {
            const filtered = incomingValues.filter(value => !existing.values.includes(value));
            if (!filtered.length) return false;
            existing.mode = 'include';
            existing.values = filtered;
            return true;
        }

        return false;
    }

    private static createEffect(sheet: BC.DocCreateData, effect: BC.AECreateData, targetId?: string, condition?: { _TEXT: string }) {
        effect.system ??= {};
        effect.system.changes ??= [];
        const changes = IH.getArray(effect.system.changes);

        for (const change of changes) {
            change.value = this.normalizeValue(sheet, change.value);
            // SimpleEffect doesn't contain change type, so explicitly add a default to not rely on foundry defaults.
            if (!change.type) change.type = 'add';
        }

        const conditionKey = condition?._TEXT;
        if (targetId && conditionKey) {
            const translation = BC.BonusConstant.limitConditionTable[conditionKey] as BC.LimitConditionTranslation | undefined;
            if (!translation) {
                effect.disabled = true;
                ChummerImportCoverage.skip(`condition ${conditionKey}: no filter, imported disabled`, sheet.name ?? 'unnamed');
            } else {
                const target = IH.getArray(effect.system?.targets).find(target => target.id === targetId);
                if (!target) {
                    effect.disabled = true;
                } else {
                    for (const translatedCondition of translation.conditions) {
                        if (!this.mergeCondition(target, translatedCondition)) {
                            effect.disabled = true;
                            break;
                        }
                    }
                    if (translation.disabled) effect.disabled = true;
                }
            }
        }

        sheet.effects!.push({
            name: sheet.name,
            img: sheet.img,
            ...effect,
        });
    }

    public static addBonus(sheet: BC.DocCreateData, bonus?: BonusSchema, options: { onlyForWireless?: boolean } = {}): void {
        if (!bonus) return;
        const start = sheet.effects?.length ?? 0;
        this.addEffects(sheet, bonus);
        if (options.onlyForWireless) {
            for (const effect of sheet.effects?.slice(start) ?? []) {
                effect.system ??= {};
                effect.system.onlyForWireless = true;
            }
        }
        const block = options.onlyForWireless ? 'wirelessbonus' : 'bonus';
        for (const key of Object.keys(bonus)) {
            if (key === '$') continue;
            if (this.handledBonuses.has(key)) ChummerImportCoverage.add(`${block}.${key}`);
            else ChummerImportCoverage.skip(`${block}.${key}: no faithful target`, sheet.name ?? 'unnamed');
        }
    }

    private static addEffects(sheet: BC.DocCreateData, bonus: BonusSchema): void {
        sheet.effects ??= [];

        for (const [key, data] of Object.entries(bonus)) {
            const baseEffect = BC.BonusConstant.simpleEffects[key] as BC.AECreateData | undefined;
            if (data && typeof data === 'object' && '_TEXT' in data && baseEffect) {
                const applyEffect = foundry.utils.deepClone(baseEffect);
                for (const change of applyEffect.system?.changes ?? [])
                    change.value = data._TEXT as string;
                this.createEffect(sheet, applyEffect);
            }
        }

        if (bonus.conditionmonitor) {
            const cm = bonus.conditionmonitor;

            if (cm.overflow) {
                this.createEffect(
                    sheet, {
                        system: {
                            changes: [{ key: "system.modifiers.physical_overflow_track", value: cm.overflow._TEXT, type: 'override' }],
                        },
                    },
                );
            }

            if (cm.physical) {
                this.createEffect(
                    sheet, {
                        system: {
                            changes: [{ key: "system.modifiers.physical_track", value: cm.physical._TEXT, type: 'override' }],
                        },
                    },
                );
            }

            if (cm.stun) {
                this.createEffect(
                    sheet, {
                        system: {
                            changes: [{ key: "system.modifiers.stun_track", value: cm.stun._TEXT, type: 'override' }],
                        },
                    }
                );
            }

            if (cm.threshold) {
                this.createEffect(
                    sheet, {
                        system: {
                            changes: [{ key: "system.modifiers.wound_tolerance", value: cm.threshold._TEXT }],
                        },
                    },
                );
            }

            if (cm.thresholdoffset) {
                this.createEffect(
                    sheet, {
                        system: {
                            changes: [{ key: "system.modifiers.pain_tolerance_physical", value: cm.thresholdoffset._TEXT }],
                        },
                    }
                );
            }

            if (cm.sharedthresholdoffset) {
                this.createEffect(
                    sheet, {
                        system: {
                            changes: [
                                { key: "system.modifiers.pain_tolerance_physical", value: cm.sharedthresholdoffset._TEXT },
                                { key: "system.modifiers.pain_tolerance_stun", value: cm.sharedthresholdoffset._TEXT },
                            ],
                        },
                    }
                );
            }
        }

        if (bonus.limitmodifier) {
            for (const limitModifier of IH.getArray(bonus.limitmodifier)) {
                const name = limitModifier.limit._TEXT;
                const key = SkillNamingFlow.nameToKey(name);

                this.createEffect(
                    sheet, {
                        system: {
                            changes: [{ key: "data.limit", value: limitModifier.value._TEXT, target: 'limit_filter' }],
                            targets: [{ id: 'limit_filter', applyTo: 'test_all', conditions: [{ type: 'limits', mode: 'include', values: [key] }] }],
                        },
                    }, 'limit_filter', limitModifier.condition
                );
            }
        }

        if (bonus.skillattribute) {
            for (const skill of IH.getArray(bonus.skillattribute)) {
                const key = Constants.attributeTable[skill.name._TEXT];

                this.createEffect(
                    sheet, {
                        system: {
                            changes: [{ key: "data.pool", value: skill.bonus._TEXT, target: 'attr_filter' }],
                            targets: [{ id: 'attr_filter', applyTo: 'test_all', conditions: [{ type: 'attributes', mode: 'include', values: [key] }] }],
                        },
                    }, 'attr_filter', skill.condition
                );
            }
        }

        if (bonus.skillcategory) {
            for (const skillCategory of IH.getArray(bonus.skillcategory)) {
                const excludedSkill = this.normalizeSkillName(skillCategory.exclude?._TEXT ?? "");

                type Keys = keyof typeof BC.BonusConstant.skillCategoryTable;
                const categoryName = skillCategory.name._TEXT;
                const categorySkills = BC.BonusConstant.skillCategoryTable[categoryName as Keys];
                if (!categorySkills) {
                    ChummerImportCoverage.skip('bonus.skillcategory: unknown category', `${sheet.name}: ${categoryName}`);
                    continue;
                }
                const skills = categorySkills.filter(skillId => !excludedSkill || skillId !== excludedSkill);

                if (!skills.length)
                    console.log("Error skillcategory:", skillCategory.name._TEXT);
                else
                    this.createEffect(
                        sheet, {
                            system: {
                                changes: [{ key: "data.pool", value: skillCategory.bonus._TEXT, target: 'category_filter' }],
                                targets: [{ id: 'category_filter', applyTo: 'test_all', conditions: [{ type: 'skills', mode: 'include', values: skills }] }],
                            },
                        }, 'category_filter', skillCategory.condition
                    );
            }
        }

        if (bonus.skillgroup) {
            for (const skillGroup of IH.getArray(bonus.skillgroup)) {
                const excludedSkill = this.normalizeSkillName(skillGroup.exclude?._TEXT ?? "");

                type Keys = keyof typeof BC.BonusConstant.skillGroupTable;
                const skills = BC.BonusConstant.skillGroupTable[skillGroup.name._TEXT as Keys]
                                .filter(skillId => !excludedSkill || skillId !== excludedSkill);

                this.createEffect(
                    sheet, {
                        system: {
                            changes: [{ key: "data.pool", value: skillGroup.bonus._TEXT, target: 'group_filter' }],
                            targets: [{ id: 'group_filter', applyTo: 'test_all', conditions: [{ type: 'skills', mode: 'include', values: skills }] }],
                        },
                    }, 'group_filter', skillGroup.condition
                );
            }
        }

        if (bonus.specificattribute) {
            for (const attribute of IH.getArray(bonus.specificattribute)) {
                if (attribute.val == null) continue;

                const name = attribute.name._TEXT;
                const normalName = Constants.attributeTable[name];

                this.createEffect(
                    sheet, {
                        system: { changes: [{ key: `system.attributes.${normalName}`, value: attribute.val._TEXT }] },
                    }
                );
            }
        }

        if (bonus.specificskill) {
            for (const skill of IH.getArray(bonus.specificskill)) {
                const name = skill.name._TEXT;
                const key = this.normalizeSkillName(name);

                this.createEffect(
                    sheet, {
                        system: {
                            changes: [{ key: "data.pool", value: skill.bonus._TEXT, target: 'skill_filter' }],
                            targets: [{ id: 'skill_filter', applyTo: 'test_all', conditions: [{ type: 'skills', mode: 'include', values: [key] }] }],
                        },
                    }, 'skill_filter', skill.condition
                );
            }
        }

        // Essence penalty in hundredths of a point.
        if (bonus.essencepenaltyt100) {
            this.createEffect(
                sheet, {
                    system: { changes: [{ key: "system.attributes.essence", value: `(${bonus.essencepenaltyt100._TEXT}) / 100` }] },
                }
            );
        }

        for (const [key, entries] of [['walk', bonus.walkmultiplier], ['run', bonus.runmultiplier]] as const) {
            for (const movement of IH.getArray(entries)) {
                if (movement.category._TEXT !== 'Ground') {
                    ChummerImportCoverage.skip(`bonus.${key}multiplier: ${movement.category._TEXT} movement has no field`, sheet.name ?? 'unnamed');
                    continue;
                }

                // Foundry moves Agility × (rate + modifier), so a percent of the rate becomes a flat modifier.
                const value = (Number(movement.val?._TEXT) || 0)
                    + this.movementRates[key] * (Number(movement.percent?._TEXT) || 0) / 100;
                if (!value) continue;

                this.createEffect(
                    sheet, {
                        system: { changes: [{ key: `system.modifiers.${key}`, value: value.toString() }] },
                    }
                );
            }
        }

        if (bonus.spellcategory) {
            for (const spellCategory of IH.getArray(bonus.spellcategory)) {
                const category = this.spellCategories[spellCategory.name._TEXT];
                if (!category) {
                    ChummerImportCoverage.skip('bonus.spellcategory: unknown category', `${sheet.name}: ${spellCategory.name._TEXT}`);
                    continue;
                }

                // Only spellcasting tests, so alchemical preparation triggers and rituals are left out.
                this.createEffect(
                    sheet, {
                        system: {
                            changes: [{ key: "data.pool", value: spellCategory.val._TEXT, target: 'spell_filter' }],
                            targets: [{ id: 'spell_filter', applyTo: 'test_all', conditions: [
                                { type: 'tests', mode: 'include', values: ['SpellCastingTest'] },
                                { type: 'categories', mode: 'include', values: [category] },
                            ] }],
                        },
                    }
                );
            }
        }

        for (const [key, value] of [['data.damage', bonus.unarmeddv], ['data.damage.ap', bonus.unarmedap]] as const) {
            if (!value) continue;

            this.createEffect(
                sheet, {
                    system: {
                        changes: [{ key, value: value._TEXT, target: 'unarmed_filter' }],
                        targets: [{ id: 'unarmed_filter', applyTo: 'test_all', conditions: [
                            { type: 'skills', mode: 'include', values: ['unarmed_combat'] },
                            { type: 'categories', mode: 'include', values: ['attack_melee'] },
                        ] }],
                    },
                }
            );
        }
    }

}
