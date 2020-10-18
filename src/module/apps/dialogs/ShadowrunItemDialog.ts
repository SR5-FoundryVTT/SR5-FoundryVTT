import {SR5Item} from '../../item/SR5Item';
import {Helpers} from '../../helpers';
import {LENGTH_UNIT, SR} from "../../constants";
import {SR5Actor} from "../../actor/SR5Actor";
import FireModeData = Shadowrun.FireModeData;
import RangesTemplateData = Shadowrun.RangesTemplateData;
import RangeData = Shadowrun.RangeData;

type ItemDialogData = {
    dialogData: DialogData | undefined,
    getModifierData: Function | undefined,
    itemHasNoDialog: boolean
};

type AttackModifierData = {
    environmental?: {
        range?: number
    },
    fireMode?: FireModeData,
    target?: Token
}

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
            getModifierData: undefined,
            itemHasNoDialog: true
        };

        if (item.isRangedWeapon()) {
            itemData.getModifierData = ShadowrunItemDialog.addRangedWeaponData(templateData, dialogData, item);
            templatePath = 'systems/shadowrun5e/dist/templates/rolls/range-weapon-roll.html';
        } else if (item.isSpell()) {
            itemData.getModifierData = ShadowrunItemDialog.addSpellData(templateData, dialogData, item);
            templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-spell.html';
        } else if (item.isComplexForm()) {
            itemData.getModifierData = ShadowrunItemDialog.addComplexFormData(templateData, dialogData, item);
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

    static addComplexFormData(templateData: object, dialogData: DialogData, item: SR5Item): Function {
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

        return async (html) => {
            if (cancel) return false;
            const level = Helpers.parseInputToNumber($(html).find('[name=level]').val());
            await item.setLastComplexFormLevel({value: level});
            return true;
        };
    }

    static addSpellData(templateData: object, dialogData: DialogData, item: SR5Item): Function {
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

        return async (html) => {
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
        // TODO: This should be moved into constants or some kind of 'rulesData'
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
        templateData['targetRange'] = item.getLastFireRangeMod();

        templateData['targetsSelected'] = Helpers.userHasTargets();
        if (item.actor.hasToken() && Helpers.userHasTargets()) {
            templateData['targets'] = ShadowrunItemDialog._getTargetRangeTemplateData(item.actor, templateRanges);
        }

        let cancel = true;
        dialogData.buttons = {
            continue: {
                label: game.i18n.localize('SR5.Continue'),
                callback: () => (cancel = false),
            },
        };

        // TODO: Move this selection handler to an appropriate place. Maybe split ShadowrunItemDialog into subclasses.
        return async (html): Promise<AttackModifierData|undefined> => {
            if (cancel) {
                return;
            }

            const modifierData: AttackModifierData = {};

            if (Helpers.userHasTargets()) {
                mergeObject(modifierData, ShadowrunItemDialog._getSelectedTargetRangeModifier(html));
            } else {
                mergeObject(modifierData, ShadowrunItemDialog._getSelectedRangeModifier(html));
                // Store lastFireRange for generic range selection.
            }

            mergeObject(modifierData, ShadowrunItemDialog._getSelectedFireMode(html, fireModes))

            // Store selections for next dialog.
            if (modifierData.environmental?.range) {
                await item.setLastFireRangeMod({value: modifierData.environmental.range});
            }
            if (modifierData.fireMode) {
                await item.setLastFireMode(modifierData.fireMode);
            }

            console.error('rangeGetModifierData', modifierData);
            return modifierData;
        };
    }

    static _getRangeWeaponTemplateData(ranges: RangeData): RangesTemplateData {
        const {range_modifiers} = SR.combat.environmental;
        const newRanges = {} as RangesTemplateData;
        for (const [key, value] of Object.entries(ranges)) {
            const distance = value as number;
            newRanges[key] = Helpers.createRangeDescription(CONFIG.SR5.weaponRanges[key], distance, range_modifiers[key]);
        }
        return newRanges;
    }

    /** Build template data for target distances and resulting range modifiers
     *
     * It is mandatory for an actor to have token placed,
     * so distance measurements can be taken.
     *
     */
    static _getTargetRangeTemplateData(actor: SR5Actor, ranges) {
        if (!actor.hasToken() || !Helpers.userHasTargets()) {
            return [];
        }

        const attacker = actor.getToken();
        const targets = Helpers.getUserTargets();

        return targets.map(target => {
            //@ts-ignore // undefined actor is okay
            const distance = Helpers.measureTokenDistance(attacker, target);
            const range = Helpers.getWeaponRange(distance, ranges);
            return {
                id: target.id,
                name: target.name,
                range: range,
                unit: LENGTH_UNIT,
                distance
            };
        });
    }

    static _getSelectedTargetRangeModifier(html: JQuery): object {
        const selectElement = $(html).find('[name="selected-target"]');
        const range = Helpers.parseInputToNumber(selectElement.find(':selected').data('range-modifier'));
        const targetId = selectElement.val() as string;
        const target = Helpers.getToken(targetId);

        return {
            environmental: {range},
            target
        };
    }

    static _getSelectedRangeModifier(html: JQuery): object {
        const range = Helpers.parseInputToNumber($(html).find('[name="range"]').val());

        return {environmental: {range}}
    }

    static _getSelectedFireMode(html: JQuery, fireModes): object {
        const fireModeValue = Helpers.parseInputToNumber($(html).find('[name="fireMode"]').val());
        if (fireModeValue) {
            const fireModeString = fireModes[fireModeValue];
            const defenseModifier = Helpers.mapRoundsToDefenseDesc(fireModeValue);

            const fireMode: FireModeData = {
                label: fireModeString,
                value: fireModeValue,
                defense: defenseModifier,
            };

            return {fireMode};
        }

        return {};
    }
}
