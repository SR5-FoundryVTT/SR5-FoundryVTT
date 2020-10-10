import {SR5Item} from '../../item/SR5Item';
import {Helpers} from '../../helpers';
import {SR} from "../../constants";

type ItemDialogData = {
    dialogData: DialogData | undefined,
    getSelectedData: Function | undefined,
    itemHasNoDialog: boolean
};

// TODO: Why extend dialog when internal dialog structures aren't used? Could resolve the whole flag / data flow issue.
export class ShadowrunItemDialog extends Dialog {
    static async fromItem(item: SR5Item, event?: MouseEvent): Promise<ItemDialogData> {
        const dialogData: DialogData = {
            title: item.name,
            buttons: {},
        };
        if (event) dialogData['event'] = event;

        const templateData = {};
        let templatePath = '';


        const itemData: ItemDialogData = {
            dialogData: undefined,
            getSelectedData: undefined,
            itemHasNoDialog: true
        };

        if (item.isRangedWeapon()) {
            itemData.getSelectedData = ShadowrunItemDialog.addRangedWeaponData(templateData, dialogData, item);
            templatePath = 'systems/shadowrun5e/dist/templates/rolls/range-weapon-roll.html';
        } else if (item.isSpell()) {
            ShadowrunItemDialog.addSpellData(templateData, dialogData, item);
            templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-spell.html';
        } else if (item.isComplexForm()) {
            ShadowrunItemDialog.addComplexFormData(templateData, dialogData, item);
            templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-complex-form.html';
        }

        if (templatePath) {
            const dialog = await renderTemplate(templatePath, templateData);

            itemData.dialogData = mergeObject(dialogData, {
                content: dialog,
            });
            itemData.itemHasNoDialog = false;
        }

        return itemData;
    }

    static addComplexFormData(templateData: object, dialogData: DialogData, item: SR5Item): void {
        const fade = item.getFade();
        const title = `${Helpers.label(item.name)} Level`;

        const level = item.getLastComplexFormLevel()?.value || 2 - fade;

        templateData['fade'] = fade >= 0 ? `+${fade}` : fade;
        templateData['level'] = level;
        templateData['title'] = title;

        let cancel = true;
        dialogData.buttons = {
            roll: {
                label: 'Continue',
                icon: '<i class="fas fa-dice-six"></i>',
                callback: () => (cancel = false),
            },
        };
        dialogData.close = async (html) => {
            if (cancel) return false;
            const level = Helpers.parseInputToNumber($(html).find('[name=level]').val());
            await item.setLastComplexFormLevel({value: level});
            return true;
        };
    }

    static addSpellData(templateData: object, dialogData: DialogData, item: SR5Item): void {
        const title = `${Helpers.label(item.name)} Force`;
        const drain = item.getDrain();

        const force = item.getLastSpellForce()?.value || 2 - drain;

        templateData['drain'] = drain >= 0 ? `+${drain}` : `${drain}`;
        templateData['force'] = force;
        templateData['title'] = title;

        dialogData.title = title;
        let cancel = true;
        let reckless = false;
        dialogData.buttons = {
            normal: {
                label: game.i18n.localize('SR5.NormalSpellButton'),
                callback: () => (cancel = false),
            },
            reckless: {
                label: game.i18n.localize('SR5.RecklessSpellButton'),
                callback: () => {
                    reckless = true;
                    cancel = false;
                },
            },
        };
        dialogData.default = 'normal';
        dialogData.close = async (html) => {
            if (cancel) return false;
            const force = Helpers.parseInputToNumber($(html).find('[name=force]').val());
            await item.setLastSpellForce({value: force, reckless});
            return true;
        };
    }

    static addRangedWeaponData(templateData: object, dialogData: DialogData, item: SR5Item): Function {
        let title = dialogData.title || item.name;

        const itemData = item.data.data;
        const fireModes = {};

        const {modes, ranges} = itemData.range;
        const {ammo} = itemData;
        if (modes.single_shot) {
            fireModes['1'] = game.i18n.localize("SR5.WeaponModeSingleShotShort");
        }
        if (modes.semi_auto) {
            fireModes['1'] = game.i18n.localize("SR5.WeaponModeSemiAutoShort");
            fireModes['3'] = game.i18n.localize("SR5.WeaponModeSemiAutoBurst");
        }
        if (modes.burst_fire) {
            fireModes['3'] = `${modes.semi_auto ? `${game.i18n.localize("SR5.WeaponModeSemiAutoBurst")}/` : ''}${game.i18n.localize("SR5.WeaponModeBurstFireShort")}`;
            fireModes['6'] = game.i18n.localize("SR5.WeaponModeBurstFireLong");
        }
        if (modes.full_auto) {
            fireModes['6'] = `${modes.burst_fire ? 'LB/' : ''}${game.i18n.localize("SR5.WeaponModeFullAutoShort")}(s)`;
            fireModes['10'] = `${game.i18n.localize("SR5.WeaponModeFullAutoShort")}(c)`;
            fireModes['20'] = game.i18n.localize('SR5.Suppressing');
        }

        const templateRanges = this._getRangeWeaponTemplateData(ranges);
        const fireMode = item.getLastFireMode();
        const rc = item.getRecoilCompensation(true);
        templateData['fireModes'] = fireModes;
        templateData['fireMode'] = fireMode?.value;
        templateData['rc'] = rc;
        templateData['ammo'] = ammo;
        templateData['title'] = title;
        templateData['ranges'] = templateRanges;
        console.error('ranges', templateRanges);
        templateData['targetRange'] = item.getLastFireRangeMod();
        console.error(templateRanges);

        // TODO: Move this mess into a little function.
        const attacker = Helpers.getActorToken(item.actor);
        const userTargets = Helpers.getUserTargets();
        let targetData;
        if (userTargets && !attacker) {
            // TODO: User warning message.
            console.error(`Actor ${item.actor.name} has no token active`);
        } else {
            targetData = userTargets.map(target => {
                //@ts-ignore
                const distance = Helpers.measureTokenDistance(attacker, target);
                const range = Helpers.getWeaponRange(distance, templateRanges);
                // TODO: Handle outside of range.
                return range ? {
                    id: target.id,
                    name: target.name,
                    range: range,
                    unit: 'm',
                    distance
                } : undefined;
            });
            console.error(targetData);
        }

        templateData['targets'] = targetData;

        let cancel = true;
        dialogData.buttons = {
            continue: {
                label: game.i18n.localize('SR5.Continue'),
                callback: () => (cancel = false),
            },
        };

        return async (html): Promise<object> => {
            if (cancel) {
                return {}
            }

            const fireMode = Helpers.parseInputToNumber($(html).find('[name="fireMode"]').val());
            const targetRangeModifier = Helpers.parseInputToNumber($(html).find('[name="target-range-modifier"]').val());

            // TODO: This here is difficult to parse and should instead be handled during dialog rendering...
            let range = targetRangeModifier ? targetRangeModifier : Helpers.parseInputToNumber($(html).find('[name="range"]').val());
            if (range) {
                await item.setLastFireRangeMod({value: range});
            }

            if (fireMode) {
                const fireModeString = fireModes[fireMode];
                const defenseModifier = Helpers.mapRoundsToDefenseDesc(fireMode);
                const fireModeData = {
                    label: fireModeString,
                    value: fireMode,
                    defense: defenseModifier,
                };
                await item.setLastFireMode(fireModeData);
            }
            return {targetModifier: targetRangeModifier};
        };
    }

    static _getRangeWeaponTemplateData(ranges) {
        const {range_modifiers} = SR.combat.environmental;
        const newRanges = {};
        for (const [key, value] of Object.entries(ranges)) {
            newRanges[key] = {
                distance: value,
                label: CONFIG.SR5.weaponRanges[key],
                modifier: range_modifiers[key],
            };
        }
        return newRanges;
    }
}
