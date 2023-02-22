import {FormDialog, FormDialogData} from "./FormDialog";
import {SR5Actor} from "../../actor/SR5Actor";
import {PartsList} from "../../parts/PartsList";
import {Helpers} from "../../helpers";
import {SkillFlow} from "../../actor/flows/SkillFlow";
import SoakRollOptions = Shadowrun.SoakRollOptions;
import SkillDialogOptions = Shadowrun.SkillDialogOptions;
import DamageType = Shadowrun.DamageType;
import {SR5} from "../../config";

export class ShadowrunActorDialogs {
    static async createSoakDialog(options: SoakRollOptions, soakParts: PartsList<number>): Promise<FormDialog> {
        const soakDialogData = ShadowrunActorDialogs.getSoakDialogData(options, soakParts);
        return new FormDialog(soakDialogData);
    }

    static async createSkillDialog(actor: SR5Actor, options: SkillDialogOptions, partsProps: PartsList<number>): Promise<FormDialog> {
        const skillDialogData = ShadowrunActorDialogs.getSkillDialogData(actor, options, partsProps);

        return new FormDialog(skillDialogData);
    }


    static getSoakDialogData(soakRollOptions: SoakRollOptions, soakParts : PartsList<number>): FormDialogData {
        const title = game.i18n.localize('SR5.DamageResistanceTest');

        const templatePath = 'systems/shadowrun5e/dist/templates/rolls/roll-soak.html';
        const templateData = {
            damage: soakRollOptions?.damage,
            parts: soakParts.getMessageOutput(),
            elementTypes: SR5.elementTypes,
            damageTypes: SR5.damageTypes
        };

        const buttons =  {
            continue: {
                label: game.i18n.localize('SR5.Continue'),
                callback: () => {},
            },
        };

        const onAfterClose = (html: JQuery) => {
            const incomingDamage = Helpers.parseInputToNumber($(html).find('[name=incomingDamage]').val());
            const ap = Helpers.parseInputToNumber($(html).find('[name=ap]').val());
            const element = Helpers.parseInputToString($(html).find('[name=element]').val());
            const damageType = Helpers.parseInputToString($(html).find('[name=damageType]').val()) as DamageType;

            return {incomingDamage, damageType, ap, element};
        }

        return {
            title,
            templatePath,
            templateData,
            buttons,
            onAfterClose
        } as unknown as FormDialogData;
    }

    static getSkillDialogData(actor: SR5Actor, options: SkillDialogOptions, partsProps: PartsList<number>): FormDialogData {
        const title = game.i18n.localize(options.skill.label || options.skill.name);
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
            // Legacy skills have a label, but no name. Custom skills have a name but no label.
            const skillLabel = game.i18n.localize(options.skill.label || options.skill.name);
            const attributeLabel = game.i18n.localize(SR5.attributes[newAtt]);
            const testLabel = game.i18n.localize('SR5.Test')

            const skillTestTitle = `${skillLabel} + ${attributeLabel} ${testLabel}`;

            partsProps.addUniquePart(attribute.label, attribute.value);

            SkillFlow.handleDefaulting(options.skill, partsProps);

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
        } as unknown as FormDialogData;
    }
}