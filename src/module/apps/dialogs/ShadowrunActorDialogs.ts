import {FormDialog, FormDialogData} from "./FormDialog";
import {SR5Actor} from "../../actor/SR5Actor";
import {PartsList} from "../../parts/PartsList";
import {Helpers} from "../../helpers";
import DefenseRollOptions = Shadowrun.DefenseRollOptions;
import ModList = Shadowrun.ModList;
import SoakRollOptions = Shadowrun.SoakRollOptions;
import DamageData = Shadowrun.DamageData;
import DamageElement = Shadowrun.DamageElement;


export class ShadowrunActorDialogs {
    static async createDefenseDialog(actor: SR5Actor, options: DefenseRollOptions, partsProps: ModList<number>): Promise<FormDialog> {
        const defenseDialogData = ShadowrunActorDialogs.getDefenseDialogData(actor, options, partsProps);

        return new FormDialog(defenseDialogData);
    }

    static async createSoakDialog(actor: SR5Actor, options: SoakRollOptions, partsProps: ModList<number>): Promise<FormDialog> {
        const soakDialogData = ShadowrunActorDialogs.getSoakDialogData(actor, options, partsProps);

        return new FormDialog(soakDialogData);
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
        if (options.incomingAttack?.reach) {
            const incomingReach = options.incomingAttack.reach;
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

            if (cover) {
                parts.addUniquePart('SR5.Cover', cover)
            }
            if (special) {
                // TODO subtract initiative score when Foundry updates to 0.7.0
                const defense = activeDefenses[special];
                parts.addUniquePart(defense.label, defense.value);
            }

            return {cover, special, parts};
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
                : {
                    base: 0,
                    value: 0,
                    mod: [],
                    ap: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    attribute: '' as const,
                    type: {
                        base: '',
                        value: '',
                    },
                    element: {
                        base: '',
                        value: '',
                    },
                };

            const armor = actor.getArmor();

            // handle element changes
            const element = Helpers.parseInputToString($(html).find('[name=element]').val());
            if (element) {
                soak.element.value = element as DamageElement;
            }
            const bonusArmor = armor[element] ?? 0;
            if (bonusArmor) {
                parts.addUniquePart(CONFIG.SR5.elementTypes[element], bonusArmor);
            }

            // handle ap changes
            const ap = Helpers.parseInputToNumber($(html).find('[name=ap]').val());
            if (ap) {
                let armorVal = armor.value + bonusArmor;

                // don't take more AP than armor
                parts.addUniquePart('SR5.AP', Math.max(ap, -armorVal));
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
}