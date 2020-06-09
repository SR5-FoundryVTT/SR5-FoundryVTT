import ModList = Shadowrun.ModList;
import { Helpers } from '../helpers';
import DamageData = Shadowrun.DamageData;
import { SR5Actor } from '../actor/SR5Actor';
import RollEvent = Shadowrun.RollEvent;

interface BasicRollProps {
    parts: ModList<number>;
    limitPart?: ModList<number>;
    explodeSixes?: boolean;
    title?: string;
    actor?: SR5Actor;
    damage?: DamageData;
    opposedTest?: (target: Actor | Token | User, event) => void;
}

interface RollDialogOptions {
    environmental?: number | boolean;
    prompt?: boolean;
}

interface AdvancedRollProps extends BasicRollProps {
    event?: RollEvent;
    extended?: boolean;
    wounds?: boolean;
    after?: (roll: Roll | undefined) => void;
    dialogOptions?: RollDialogOptions;
}

export class ShadowrunRoller {
    static shadowrunFormula({ parts, limitPart, explode }): string {
        const count = Helpers.totalMods(parts);
        const limit = Helpers.totalMods(limitPart);
        if (count <= 0) {
            // @ts-ignore
            ui.notifications.error(game.i18n.localize('SR5.RollOneDie'));
            return '0d6cs>=5';
        }
        let formula = `${count}d6`;
        if (explode) {
            formula += 'x6';
        }
        if (limit) {
            formula += `kh${limit}`;
        }
        formula += 'cs>=5';
        return formula;
    }

    static async basicRoll({
        parts,
        limitPart,
        explodeSixes,
        title,
        damage,
        actor,
        opposedTest,
    }: BasicRollProps): Promise<Roll | undefined> {
        const formula = this.shadowrunFormula({ parts, limitPart, explode: explodeSixes });
        if (!formula) return;
        let roll = new Roll(formula);
        let rollMode = game.settings.get('core', 'rollMode');
        roll.roll();

        if (game.settings.get('shadowrun5e', 'displayDefaultRollCard')) {
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                flavor: title,
                rollMode: rollMode,
            });
        }

        // start of custom message
        const dice = roll.parts[0].rolls;
        const token = actor?.token;
        const templateData = {
            actor: actor,
            tokenId: token ? `${token.scene._id}.${token.id}` : null,
            dice,
            limitPart,
            testName: title,
            parts,
            opposedTest,
            damage,
            hits: roll.total,
        };

        const template = `systems/shadowrun5e/templates/rolls/roll-card.html`;
        const html = await renderTemplate(template, templateData);

        const chatData = {
            user: game.user._id,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: html,
            speaker: {
                actor: actor?._id,
                token: actor?.token,
                alias: actor?.name,
            },
        };

        if (['gmroll', 'blindroll'].includes(rollMode))
            chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
        if (rollMode === 'blindroll') chatData['blind'] = true;

        await ChatMessage.create(chatData, { displaySheet: false });

        return roll;
    }

    static advancedRoll(props: AdvancedRollProps) {
        // destructure what we need to use from props
        // any value pulled out needs to be updated back in props if changed
        const { title, actor, parts, limitPart, extended, wounds, after, dialogOptions } = props;

        // remove limits if game settings is set
        if (!game.settings.get('shadowrun5e', 'applyLimits')) {
            delete props.limitPart;
        }

        // TODO create "fast roll" option

        let dialogData = {
            options: dialogOptions,
            extended,
            dice_poll: Helpers.totalMods(parts),
            parts,
            limit: Helpers.totalMods(limitPart),
            wounds,
        };
        let template = 'systems/shadowrun5e/templates/rolls/roll-dialog.html';
        let edge = false;
        let cancel = false;

        const buttons = {
            roll: {
                label: 'Roll',
                icon: '<i class="fas fa-dice-six"></i>',
                callback: () => (cancel = false),
            },
        };
        if (actor) {
            buttons['edge'] = {
                label: `Push the Limit (+${actor.getEdge().max})`,
                icon: '<i class="fas fa-bomb"></i>',
                callback: () => {
                    edge = true;
                    cancel = false;
                },
            };
        }

        return new Promise((resolve) => {
            renderTemplate(template, dialogData).then((dlg) => {
                new Dialog({
                    title: title,
                    content: dlg,
                    buttons,
                    default: 'roll',

                    close: async (html) => {
                        if (cancel) return;
                        // get the actual dice_pool from the difference of initial parts and value in the dialog

                        const woundValue = -Helpers.parseInputToNumber(
                            $(html).find('[name="wounds"]').val()
                        );
                        const situationMod = Helpers.parseInputToNumber(
                            $(html).find('[name="dp_mod"]').val()
                        );
                        const environmentMod = Helpers.parseInputToNumber(
                            $(html).find('[name="options.environmental"]').val()
                        );

                        if (woundValue) {
                            parts['SR5.Wounds'] = woundValue;
                            props.wounds = true;
                        }
                        if (situationMod) parts['SR5.SituationalModifier'] = situationMod;
                        if (environmentMod) {
                            parts['SR5.EnvironmentModifier'] = environmentMod;
                            if (!props.dialogOptions) props.dialogOptions = {};
                            props.dialogOptions.environmental = true;
                        }

                        const extendedString = Helpers.parseInputToString(
                            $(html).find('[name="extended"]').val()
                        );
                        const extended = extendedString === 'true';

                        if (edge && actor) {
                            parts['SR5.PushTheLimit'] = actor.getEdge().max;
                            await actor.update({
                                'data.attributes.edge.value':
                                    actor.data.data.attributes.edge.value - 1,
                            });
                        }

                        props.parts = parts;
                        const r = this.basicRoll({
                            ...props,
                        });

                        if (extended && r) {
                            const currentExtended = parts['SR5.Extended'] || 0;
                            parts['SR5.Extended'] = currentExtended - 1;
                            // add a bit of a delay to roll again
                            setTimeout(() => this.advancedRoll(props), 400);
                        }
                        resolve(r);
                        if (after && r) r.then((roll) => after(roll));
                    },
                }).render(true);
            });
        });
    }
}
