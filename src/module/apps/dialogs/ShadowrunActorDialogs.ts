import {FormDialog, FormDialogData} from "./FormDialog";
import {SR5Actor} from "../../actor/SR5Actor";
import {PartsList} from "../../parts/PartsList";
import {Helpers} from "../../helpers";
import DefenseRollOptions = Shadowrun.DefenseRollOptions;
import ModList = Shadowrun.ModList;
import SoakRollOptions = Shadowrun.SoakRollOptions;
import DamageData = Shadowrun.DamageData;
import DamageElement = Shadowrun.DamageElement;
import SkillRollOptions = Shadowrun.SkillRollOptions;
import SkillDialogOptions = Shadowrun.SkillDialogOptions;
import CombatData = Shadowrun.CombatData;
import {DefaultValues} from "../../importer/helper/DefaultValues";


export class ShadowrunActorDialogs {
    static async createDefenseDialog(actor: SR5Actor, options: DefenseRollOptions, partsProps: ModList<number>): Promise<FormDialog> {
        const defenseDialogData = ShadowrunActorDialogs.getDefenseDialogData(actor, options, partsProps);

        return new FormDialog(defenseDialogData);
    }

    static async createSoakDialog(actor: SR5Actor, options: SoakRollOptions, partsProps: ModList<number>): Promise<FormDialog> {
        const soakDialogData = ShadowrunActorDialogs.getSoakDialogData(actor, options, partsProps);

        return new FormDialog(soakDialogData);
    }

    static async createSkillDialog(actor: SR5Actor, options: SkillDialogOptions, partsProps: PartsList<number>): Promise<FormDialog> {
        const skillDialogData = ShadowrunActorDialogs.getSkillDialogData(actor, options, partsProps);

        return new FormDialog(skillDialogData);
    }

    static getDefenseDialogData(actor: SR5Actor,  options: DefenseRollOptions, partsProps: ModList<number>): FormDialogData {
        const title = game.i18n.localize('SR5.Defense');

        const activeDefenses = {
            full_defense: {
                label: 'SR5.FullDefense',
                value: actor.getFullDefenseAttribute()?.value,
                initMod: -10,
            },
            dodge: {
                label: 'SR5.Dodge',
                value: actor.findActiveSkill('gymnastics')?.value,
                initMod: -5,
            },
            block: {
                label: 'SR5.Block',
                value: actor.findActiveSkill('unarmed_combat')?.value,
                initMod: -5,
            },
        };

        const equippedMeleeWeapons = actor.getEquippedWeapons().filter((w) => w.isMeleeWeapon());
        let defenseReach = 0;
        equippedMeleeWeapons.forEach((weapon) => {
            activeDefenses[`parry-${weapon.name}`] = {
                label: 'SR5.Parry',
                weapon: weapon.name,
                value: actor.findActiveSkill(weapon.getActionSkill())?.value,
                init: -5,
            };
            defenseReach = Math.max(defenseReach, weapon.getReach());
        });

        const parts = new PartsList(partsProps);
        actor._addDefenseParts(parts);

        // if we are defending a melee attack
        if (options.attack?.reach) {
            const incomingReach = options.attack.reach;
            const netReach = defenseReach - incomingReach;
            if (netReach !== 0) {
                parts.addUniquePart('SR5.Reach', netReach);
            }
        }

        const buttons = {
            continue: {
                label: game.i18n.localize('SR5.Continue'),
                callback: () => {},
            },
        };

        const onAfterClose = (html) => {
            const cover = Helpers.parseInputToNumber($(html).find('[name=cover]').val());
            const special = Helpers.parseInputToString($(html).find('[name=activeDefense]').val());
            // Zero to indicate no initiative result change.
            const combat: CombatData = {};

            if (cover) {
                parts.addUniquePart('SR5.Cover', cover)
            }
            if (special) {
                // Defense pool modifier
                const defense = activeDefenses[special];
                parts.addUniquePart(defense.label, defense.value);

                // Combat initiative modifier
                combat.initiative = defense.initMod;
            }

            return {cover, special, parts, combat};
        }

        const templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-defense.html';
        const templateData = {
            parts: parts.getMessageOutput(),
            cover: options.cover,
            activeDefenses
        };

        return {
            title,
            templateData,
            templatePath,
            buttons,
            onAfterClose
        }
    }

    static getSoakDialogData(actor: SR5Actor, options: SoakRollOptions, partsProps: ModList<number>): FormDialogData {
        const title = game.i18n.localize('SR5.DamageResistanceTest');

        const parts = new PartsList(partsProps);
        actor._addSoakParts(parts);

        const templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-soak.html';
        const templateData = {
            damage: options?.damage,
            parts: parts.getMessageOutput(),
            elementTypes: CONFIG.SR5.elementTypes,
        };

        const buttons =  {
            continue: {
                label: game.i18n.localize('SR5.Continue'),
                callback: () => {},
            },
        };

        const onAfterClose = (html: JQuery) => {
            const soak: DamageData = options?.damage
                    ? options.damage
                : DefaultValues.damageData({type: {base: '', value: ''}});
            // handle ap changes
            const ap = Helpers.parseInputToNumber($(html).find('[name=ap]').val());


            const armor = actor.getArmor();
            if (armor) {
                // handle element changes
                const element = Helpers.parseInputToString($(html).find('[name=element]').val());
                if (element) {
                    soak.element.value = element as DamageElement;
                }
                const bonusArmor = armor[element] ?? 0;
                if (bonusArmor) {
                    parts.addUniquePart(CONFIG.SR5.elementTypes[element], bonusArmor);
                }

                if (ap) {
                    let armorVal = armor.value + bonusArmor;

                    // don't take more AP than armor
                    parts.addUniquePart('SR5.AP', Math.max(ap, -armorVal));
                }
            }

            // handle incoming damage changes
            const incomingDamage = Helpers.parseInputToNumber($(html).find('[name=incomingDamage]').val());
            if (incomingDamage) {
                const totalDamage = Helpers.calcTotal(soak);
                if (totalDamage !== incomingDamage) {
                    const diff = incomingDamage - totalDamage;
                    // add part and calc total again
                    soak.mod = PartsList.AddUniquePart(soak.mod, 'SR5.UserInput', diff);
                    soak.value = Helpers.calcTotal(soak);
                }

                const totalAp = Helpers.calcTotal(soak.ap);
                if (totalAp !== ap) {
                    const diff = ap - totalAp;
                    // add part and calc total
                    soak.ap.mod = PartsList.AddUniquePart(soak.ap.mod, 'SR5.UserInput', diff);
                    soak.ap.value = Helpers.calcTotal(soak.ap);
                }
            }

            return {soak, parts};
        }

        return {
            title,
            templatePath,
            templateData,
            buttons,
            onAfterClose
        }
    }

    static getSkillDialogData(actor: SR5Actor, options: SkillDialogOptions, partsProps: PartsList<number>): FormDialogData {
        const title = game.i18n.localize(options.skill.label);
        const templatePath = 'systems/shadowrun5e/dist/templates/rolls/skill-roll.html';

        const attributes = actor.getAttributes();
        const attribute = actor.getAttribute(options.attribute ? options.attribute : options.skill.attribute);
        const limits = actor.getLimits();

        const templateData = {
            attribute: options.skill.attribute,
            attributes: Helpers.filter(attributes, ([, value]) => value.value > 0),
            limit: attribute.limit,
            limits
        }


        const buttons = {
            roll: {
                label: game.i18n.localize('SR5.NormalSkillButton'),
                callback: () => {},
            },
        };
        // add specializations to dialog as buttons
        if (options.skill.specs?.length) {
            options.skill.specs.forEach(
                (spec) =>
                    (buttons[spec] = {
                        label: spec,
                        callback: () => {},
                    }),
            );
        }

        const onAfterClose = (html: JQuery, selectedButton) => {
            const newAtt = Helpers.parseInputToString($(html).find('[name="attribute"]').val());
            const newLimit = Helpers.parseInputToString($(html).find('[name="attribute.limit"]').val());
            const attribute = actor.getAttribute(newAtt);
            const limit = actor.getLimit(newLimit);
            const skillLabel = game.i18n.localize(options.skill.label);
            const attributeLabel = game.i18n.localize(CONFIG.SR5.attributes[newAtt]);
            const testLabel = game.i18n.localize('SR5.Test')

            const skillTestTitle = `${skillLabel} + ${attributeLabel} ${testLabel}`;

            partsProps.addUniquePart(attribute.label, attribute.value);

            // Check for skill defaulting at the base, since modifiers or bonus can cause a positive pool, while
            // still defaulting.
            const isDefaulting = options.skill.base === 0;
            if (isDefaulting) {
                partsProps.addUniquePart('SR5.Defaulting', -1);
            }

            // Possible specialization based on button label.
            const isSpecialization = options.skill.specs.includes(selectedButton);
            if (isSpecialization) {
                partsProps.addUniquePart('SR5.Specialization', 2);
            }

            return {
                title: skillTestTitle,
                attribute,
                limit,
                skill: options.skill,
                parts: partsProps
            }
        }

        return {
            title,
            templatePath,
            templateData,
            buttons,
            onAfterClose
        }
    }
}