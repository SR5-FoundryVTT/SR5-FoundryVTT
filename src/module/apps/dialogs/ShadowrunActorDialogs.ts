import {FormDialog, FormDialogData} from "./FormDialog";
import {SR5Actor} from "../../actor/SR5Actor";
import {PartsList} from "../../parts/PartsList";
import DefenseRollOptions = Shadowrun.DefenseRollOptions;
import ModList = Shadowrun.ModList;
import {Helpers} from "../../helpers";


export class ShadowrunActorDialogs {
    static async createDefenseDialog(actor: SR5Actor, options: DefenseRollOptions, partsProps: ModList<number>): Promise<FormDialog> {
        const defenseDialogData = ShadowrunActorDialogs.getDefenseDialogData(actor, options, partsProps);

        return new FormDialog(defenseDialogData);
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
        console.error('Not Working', parts);

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
}