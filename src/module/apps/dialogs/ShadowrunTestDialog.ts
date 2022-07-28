import {FormDialog, FormDialogData} from "./FormDialog";
import {RollDialogOptions} from "../../rolls/ShadowrunRoller";
import {PartsList} from "../../parts/PartsList";
import {SR5Actor} from "../../actor/SR5Actor";
import {CORE_FLAGS, CORE_NAME, FLAGS, SYSTEM_NAME} from "../../constants";
import {Helpers} from "../../helpers";
import ModList = Shadowrun.ModList;
import BaseValuePair = Shadowrun.BaseValuePair;
import LabelField = Shadowrun.LabelField;
import ValueField = Shadowrun.ValueField;

interface AdvancedTestRollOptions {
    title?: string
    dialogOptions?: RollDialogOptions

    // SuccessTest values
    limit?: BaseValuePair<number> & LabelField // when given, will allow setting a limit
    threshold?: ValueField // when given, will allow setting a threshold

    extended?: boolean // true - will mark the test as an extended success test
    wounds?: boolean // true - will try to fetch wound modifier from a given actor
}

export class ShadowrunTestDialog {
    static async create(actor: SR5Actor|undefined, options: AdvancedTestRollOptions, partsProps: ModList<number>): Promise<FormDialog> {
        const testDialogData = ShadowrunTestDialog.getAdvancedTestData(actor, options, partsProps);

        return new FormDialog(testDialogData);
    }

    static getAdvancedTestData(actor, options: AdvancedTestRollOptions, partsProps: ModList<number>): FormDialogData {
        const title = options.title;
        const parts = new PartsList(partsProps);

        const templateData = {
            options: options.dialogOptions,
            extended: options.extended,
            pool: parts.total,
            parts: parts.getMessageOutput(),
            limitValue: options.limit?.value,
            thresholdValue: options.threshold?.value,
            wounds: options.wounds,
            woundValue: actor?.getWoundModifier(),
            rollMode: game.settings.get(CORE_NAME, CORE_FLAGS.RollMode),
            rollModes: CONFIG.Dice.rollModes
        }

        let templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-dialog.html';

        const rollButtonName = 'roll'
        const buttons = {
            [rollButtonName]: {
                label: game.i18n.localize('SR5.Roll'),
                icon: '<i class="fas fa-dice-six"></i>',
                callback: () => {
                },
            },
        };
        if (actor) {
            buttons['edge'] = {
                label: `${game.i18n.localize('SR5.PushTheLimit')} (+${actor.getEdge().value})`,
                icon: '<i class="fas fa-bomb"></i>',
                callback: () => {
                },
            };
        }

        const onAfterClose = async (html: JQuery) => {
            const dicePoolValue = Helpers.parseInputToNumber($(html).find('[name="pool"]').val());

            if (options.dialogOptions?.pool) {
                parts.clear();
                await game.user?.setFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue, dicePoolValue);
                parts.addUniquePart('SR5.Base', dicePoolValue);
            }

            const thresholdValue = Helpers.parseInputToNumber($(html).find('[name="thresholdValue"]').val());
            const limitValue = Helpers.parseInputToNumber($(html).find('[name="limitValue"]').val());

            const {limit} = options;
            if (limit && limit.value !== limitValue) {
                limit.value = limitValue;
                limit.base = limitValue;
                limit.label = 'SR5.Override';
            }

            const {threshold} = options;
            if (threshold && threshold.value !== thresholdValue) {
                threshold.label = 'SR5.Override';
                threshold.base = thresholdValue;
                threshold.value = Helpers.calcTotal(threshold, {min: 0});
            }

            const woundValue = Helpers.parseInputToNumber($(html).find('[name="wounds"]').val());
            const situationMod = Helpers.parseInputToNumber($(html).find('[name="dp_mod"]').val());
            const environmentMod = Helpers.parseInputToNumber($(html).find('[name="options.environmental"]').val());

            let {wounds} = options;
            if (wounds && woundValue !== 0) {
                parts.addUniquePart('SR5.Wounds', woundValue);
                wounds = true;
            }
            if (situationMod) {
                parts.addUniquePart('SR5.SituationalModifier', situationMod);
            }
            if (environmentMod) {
                parts.addUniquePart('SR5.EnvironmentModifier', environmentMod);
            }

            const extendedString = Helpers.parseInputToString($(html).find('[name="extended"]').val());
            const extended = extendedString === 'true';

            const rollMode = Helpers.parseInputToString($(html).find('[name=rollMode]').val());

            return {
                limit,
                threshold,
                wounds,
                parts,
                extended,
                rollMode
            }
        };

        return {
            title,
            templateData,
            templatePath,
            buttons,
            default: rollButtonName,
            onAfterClose
        } as unknown as FormDialogData
    }
}