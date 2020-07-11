import { SR5Item } from '../../item/SR5Item';
import { Helpers } from '../../helpers';

export class ShadowrunItemDialog extends Dialog {
    static async fromItem(item: SR5Item, event?: MouseEvent): Promise<DialogData | undefined> {
        const dialogData: DialogData = {
            title: item.name,
            buttons: {},
        };
        if (event) dialogData['event'] = event;

        const templateData = {};
        let templatePath = '';

        if (item.isRangedWeapon()) {
            ShadowrunItemDialog.addRangedWeaponData(templateData, dialogData, item);
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
            return mergeObject(dialogData, {
                content: dialog,
            });
        }

        return undefined;
    }

    /*
    static get defaultOptions() {
        const options = super.defaultOptions;
        return mergeObject(options, {
            classes: ['sr5', 'sheet'],
        });
    }
     */

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
            await item.setLastComplexFormLevel({ value: level });
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
            await item.setLastSpellForce({ value: force, reckless });
            return true;
        };
    }

    static addRangedWeaponData(templateData: object, dialogData: DialogData, item: SR5Item): void {
        let title = dialogData.title || item.name;

        const itemData = item.data.data;
        const fireModes = {};

        const { modes, ranges } = itemData.range;
        const { ammo } = itemData;
        if (modes.single_shot) {
            fireModes['1'] = 'SS';
        }
        if (modes.semi_auto) {
            fireModes['1'] = 'SA';
            fireModes['3'] = 'SB';
        }
        if (modes.burst_fire) {
            fireModes['3'] = `${modes.semi_auto ? 'SB/' : ''}BF`;
            fireModes['6'] = 'LB';
        }
        if (modes.full_auto) {
            fireModes['6'] = `${modes.burst_fire ? 'LB/' : ''}FA(s)`;
            fireModes['10'] = 'FA(c)';
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

        let cancel = true;
        dialogData.buttons = {
            continue: {
                label: game.i18n.localize('SR5.Continue'),
                callback: () => (cancel = false),
            },
        };

        dialogData.close = async (html) => {
            if (cancel) return false;
            const fireMode = Helpers.parseInputToNumber($(html).find('[name="fireMode"]').val());
            const range = Helpers.parseInputToNumber($(html).find('[name="range"]').val());

            if (range) {
                await item.setLastFireRangeMod({ value: range });
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
            return true;
        };
    }

    static _getRangeWeaponTemplateData(ranges) {
        const lookup = {
            short: 0,
            medium: -1,
            long: -3,
            extreme: -6,
        };
        const newRanges = {};
        for (const [key, value] of Object.entries(ranges)) {
            newRanges[key] = {
                distance: value,
                label: CONFIG.SR5.weaponRanges[key],
                modifier: lookup[key],
            };
        }
        return newRanges;
    }
}
