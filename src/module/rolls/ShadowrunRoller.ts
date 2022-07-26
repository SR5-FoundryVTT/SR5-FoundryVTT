import ModList = Shadowrun.ModList;
import RollEvent = Shadowrun.RollEvent;
import BaseValuePair = Shadowrun.BaseValuePair;
import LabelField = Shadowrun.LabelField;
import AttackData = Shadowrun.AttackData;
import FireModeData = Shadowrun.FireModeData;
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import LimitField = Shadowrun.LimitField;
import CombatData = Shadowrun.CombatData;
import {SR5Actor} from '../actor/SR5Actor';
import {SR5Item} from '../item/SR5Item';
import {FLAGS, SR, SYSTEM_NAME} from '../constants';
import {PartsList} from '../parts/PartsList';
import {TestCreator} from "../tests/TestCreator";

export type Test =  {
    label: string;
    type: string;
}

export interface TestDialogData {
    parts: PartsList<number>
    limit: number
    wounds: boolean
    extended: boolean
    rollMode: keyof typeof CONFIG.Dice.rollModes;
}

interface RollProps {
    parts?: ModList<number>,
    limit?: any,
    explodeSixes?: boolean
}

// TODO: Separate into 'roll data' and 'template data', which only passes through but isn't used.
export interface BasicRollProps {
    parts?: ModList<number>;
    limit?: LimitField;
    explodeSixes?: boolean;
    title?: string;
    actor?: SR5Actor;
    target?: Token;
    item?: SR5Item;
    // Personal attack
    attack?: AttackData
    // Incoming attack for a defense test
    incomingAttack?: AttackData;
    damage?: ModifiedDamageData;
    tests?: Test[];
    description?: object;
    previewTemplate?: boolean;
    hideRollMessage?: boolean;
    rollMode?: keyof typeof CONFIG.Dice.rollModes;
    combat?: CombatData
}

/** Provide a clear interface of which value are guaranteed to be defined.
     */
export interface BasicRollPropsDefaulted extends BasicRollProps {
    title: string
    parts: ModList<number>
    explodeSixes: boolean
    hideRollMessage: boolean
    previewTemplate: boolean
    rollMode: keyof typeof CONFIG.Dice.rollModes
}

export interface RollDialogOptions {
    environmental?: number
    pool?: boolean
    extended?: boolean
    limit?: boolean
    wounds?: boolean
}

export interface AdvancedRollProps extends BasicRollProps {
    event?: RollEvent;
    extended?: boolean;
    wounds?: boolean;
    after?: (roll: ShadowrunRoll | undefined) => void;
    attack?: AttackData;
    fireMode?: FireModeData
    combat?: CombatData
}

/** Provide a clear interface of which value are guaranteed to be defined.
     */
export interface AdvancedRollPropsDefaulted extends AdvancedRollProps {
    parts: ModList<number>
    wounds: boolean
}

type ShadowrunRollData = {
    limit: number
    threshold: number
    parts: ModList<number>
    explodeSixes: boolean
}
export class ShadowrunRoll extends Roll {
    data: ShadowrunRollData
    // add class Roll to the json so dice-so-nice works
    toJSON(): any {
        const data = super.toJSON();
        data.class = 'Roll';
        return data;
    }

    get sides(): number[] {
        //@ts-ignore
        // 0.7.x foundryVTT
        if (this.terms) {
            //@ts-ignore
            return this.terms[0].results.map(result => result.result);
        }

        //@ts-ignore
        // 0.6.x foundryVTT
        return this.parts[0].rolls.map(roll => roll.roll);
    }

    get limit(): number {
        return this.data.limit;
    }

    get threshold(): number {
        return this.data.threshold;
    }

    //@ts-ignore // TODO: This overwrites Roll.parts with very different return types...
    get parts(): ModList<number> {
        return this.data.parts;
    }

    get explodeSixes(): boolean {
        return this.data.explodeSixes;
    }

    count(side: number): number {
        const results = this.sides;
        return results.reduce((counted, result) => result === side ? counted + 1 : counted, 0);
    }

    get hits(): number {
        return this.total || 0;
    }

    get pool(): number {
        //@ts-ignore
        // 0.7.x foundryVTT
        if (this.terms) {
            //@ts-ignore
            return this.dice[0].number;
        }

        //@ts-ignore
        // 0.6.x foundryVTT
        return this.parts[0].rolls.length;
    }

    get glitched(): boolean {
        let glitched = 0;
        SR.die.glitch.forEach(die => glitched += this.count(die));
        return glitched > Math.floor(this.pool / 2);
    }

    /**
     *
     * @param messageData
     * @param rollMode
     */
    toMessage(messageData?, rollMode?): Promise<ChatMessage|undefined> {
        console.error('message', messageData, rollMode);

        return super.toMessage(messageData, rollMode);
    }
}

export class ShadowrunRoller {
        static shadowrunFormula({
        parts: partsProps,
        limit,
        explode,
    }: {
        parts: ModList<number>;
        limit?: BaseValuePair<number> & LabelField;
        explode?: boolean;
    }): string {
        const parts = new PartsList(partsProps);
        const count = parts.total;
        if (count <= 0) {
            ui.notifications?.warn(game.i18n.localize('SR5.RollOneDie'));
            return '0d6cs>=5';
        }
        let formula = `${count}d6`;
        if (explode) {
            formula += 'x6';
        }
        if (limit?.value) {
            formula += `kh${limit.value}`;
        }
        formula += 'cs>=5';
        return formula;
    }

    /*
     * Prompt the user for a default SuccessTest
     */
    static async promptSuccessTest() {
        // Get the last used pool size for simple SuccessTestDialogs
        const lastPoolValue = Number(game.user?.getFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue)) || 0;

        const test = await TestCreator.fromPool({pool: lastPoolValue});
        await test.execute();

        if (test.evaluated) {
            // Store the last used pool size for the next simple SuccessTest
            await game.user?.setFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue, test.pool.value);
        }
    }

    /**
     * Start an advanced roll
     * - Prompts the user for modifiers
     */
    static async advancedRoll(advancedProps: AdvancedRollProps, dialogOptions?: RollDialogOptions): Promise<void> {
        // const testDialog = await ShadowrunTestDialog.create(props.actor, testDialogOptions, props.parts);
    }
}
