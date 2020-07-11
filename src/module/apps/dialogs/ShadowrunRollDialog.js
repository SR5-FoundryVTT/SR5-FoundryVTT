var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Helpers } from '../../helpers';
import { DiceSR } from '../../dice';
export class ShadowrunRollDialog extends Dialog {
    static fromItemRoll(item, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogData = {
                title: item.name,
                buttons: {},
            };
            if (event)
                dialogData['event'] = event;
            const templateData = {};
            let templatePath = '';
            if (item.isRangedWeapon()) {
                ShadowrunRollDialog.addRangedWeaponData(templateData, dialogData, item);
                templatePath = 'systems/shadowrun5e/dist/templates/rolls/range-weapon-roll.html';
            }
            else if (item.isSpell()) {
                ShadowrunRollDialog.addSpellData(templateData, dialogData, item);
                templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-spell.html';
            }
            else if (item.isComplexForm()) {
                ShadowrunRollDialog.addComplexFormData(templateData, dialogData, item);
                templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-complex-form.html';
            }
            if (templatePath) {
                const dialog = yield renderTemplate(templatePath, templateData);
                return new ShadowrunRollDialog(mergeObject(dialogData, {
                    content: dialog,
                }));
            }
            return undefined;
        });
    }
    /*
    static get defaultOptions() {
        const options = super.defaultOptions;
        return mergeObject(options, {
            classes: ['sr5', 'sheet'],
        });
    }
     */
    static addComplexFormData(templateData, dialogData, item) {
        const parts = item.getRollPartsList();
        const fade = item.getFade();
        const title = `${Helpers.label(item.name)} Level`;
        templateData['fade'] = fade >= 0 ? `+${fade}` : fade;
        templateData['level'] = 2 - fade;
        templateData['title'] = title;
        let cancel = true;
        dialogData.buttons = {
            roll: {
                label: 'Continue',
                icon: '<i class="fas fa-dice-six"></i>',
                callback: () => (cancel = false),
            },
        };
        dialogData.close = (html) => __awaiter(this, void 0, void 0, function* () {
            if (cancel)
                return;
            const level = Helpers.parseInputToNumber($(html).find('[name=level]').val());
            yield item.setLastComplexFormLevel(level);
            DiceSR.rollTest({
                event: dialogData['event'],
                dialogOptions: {
                    environmental: false,
                },
                parts,
                actor: item.actor,
                limit: level,
                title,
            }).then(() => {
                const totalFade = Math.max(item.getFade() + level, 2);
                item.actor.rollFade({ event: dialogData['event'] }, totalFade);
            });
        });
    }
    static addSpellData(templateData, dialogData, item) {
        const parts = item.getRollPartsList();
        const title = `${Helpers.label(item.name)} Force`;
        const drain = item.getDrain();
        templateData['drain'] = drain >= 0 ? `+${drain}` : `${drain}`;
        templateData['force'] = 2 - drain;
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
        dialogData.close = (html) => __awaiter(this, void 0, void 0, function* () {
            const force = Helpers.parseInputToNumber($(html).find('[name=force]').val());
            yield item.setLastSpellForce(force);
            DiceSR.rollTest({
                event: dialogData['event'],
                dialogOptions: {
                    environmental: true,
                },
                parts,
                actor: item.actor,
                limit: force,
                title: `${title} ${force}`,
            }).then((roll) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (item.data.data.category === 'combat' && roll) {
                    const attackData = item.getAttackData(roll.total, force);
                    if (attackData) {
                        yield item.setLastAttack(attackData);
                    }
                }
                const drain = Math.max(item.getDrain() + force + (reckless ? 3 : 0), 2);
                (_a = item.actor) === null || _a === void 0 ? void 0 : _a.rollDrain({ event: dialogData['event'] }, drain);
            }));
        });
    }
    static addRangedWeaponData(templateData, dialogData, item) {
        let limit = item.getActionLimit();
        const parts = item.getRollPartsList();
        let title = dialogData.title || item.name;
        const itemData = item.data.data;
        const fireModes = {};
        const { modes, ranges, ammo } = itemData.range;
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
        const targets = game.user.targets;
        console.log(targets);
        const fireMode = item.getLastFireMode();
        const rc = item.getRecoilCompensation(true);
        templateData['fireModes'] = fireModes;
        templateData['fireMode'] = fireMode;
        templateData['rc'] = rc;
        templateData['ammo'] = ammo;
        templateData['title'] = title;
        let environmental = true;
        let cancel = true;
        const buttons = {};
        buttons['short'] = {
            label: `Short (${ranges.short})`,
            callback: () => (cancel = false),
        };
        buttons['medium'] = {
            label: `Medium (${ranges.medium})`,
            callback: () => {
                environmental = 1;
                cancel = false;
            },
        };
        buttons['long'] = {
            label: `Long (${ranges.long})`,
            callback: () => {
                environmental = 3;
                cancel = false;
            },
        };
        buttons['extreme'] = {
            label: `Extreme (${ranges.extreme})`,
            callback: () => {
                environmental = 6;
                cancel = false;
            },
        };
        dialogData.buttons = buttons;
        dialogData.close = (html) => __awaiter(this, void 0, void 0, function* () {
            if (cancel)
                return;
            const fireMode = Helpers.parseInputToNumber($(html).find('[name="fireMode"]').val());
            yield item.setLastFireMode(fireMode);
            if (fireMode) {
                if (fireMode) {
                    title += ` - Defender (${Helpers.mapRoundsToDefenseDesc(fireMode)})`;
                }
                // suppressing fire doesn't cause recoil
                if (fireMode > rc && fireMode !== 20) {
                    parts['SR5.Recoil'] = rc - fireMode;
                }
                DiceSR.rollTest({
                    event: dialogData['event'],
                    parts,
                    actor: item.actor,
                    limit,
                    title,
                    dialogOptions: {
                        environmental,
                    },
                }).then((roll) => {
                    if (roll) {
                        item.useAmmo(fireMode).then(() => __awaiter(this, void 0, void 0, function* () {
                            const attackData = item.getAttackData(roll.total);
                            if (attackData) {
                                yield item.setLastAttack(attackData);
                            }
                            yield item.setLastFireMode(fireMode);
                        }));
                    }
                });
            }
        });
    }
}
