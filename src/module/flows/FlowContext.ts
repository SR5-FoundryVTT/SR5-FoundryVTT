import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import { DynamicValueEvaluator } from "@/module/effect/DynamicValueEvaluator";
import type { SR5Item } from "@/module/item/SR5Item";
import type { SuccessTest } from "@/module/tests/SuccessTest";
import type { FlowState, FlowStep } from "@/module/types/flows/FlowStep";
import type { DamageType } from "@/module/types/item/Action";

/**
 * The values of a finished test, as steps following it read them.
 */
export interface FlowTestValues {
    type: string;
    hits: number;
    netHits: number;
    glitches: number;
    success: boolean;
    // Net hits of the test an opposing test opposed, against this test.
    againstNetHits?: number;
    force?: number;
    level?: number;
    // Marks the testing actor has on its target, for matrix damage. SR5#239.
    marks?: number;
}

/**
 * The frozen values of one branch of a chain, stored in FlowState.ctx.
 *
 * - item: the item of the root test, when the chain started.
 * - primary: the test the chain calls primary, the root test unless a node is marked primary.
 * - parent: the test the current step follows.
 * - nodes: every finished test of the branch, by step id.
 * - damage: the damage the parent passes on.
 * - payload: values attached by contributors, like a toxins Power.
 * - before: what a released gate passed on.
 */
export interface FlowContextData {
    item?: Record<string, unknown>;
    primary?: FlowTestValues;
    parent?: FlowTestValues;
    nodes?: Record<string, FlowTestValues>;
    damage?: { value: number, type: string, ap: number, element: string };
    payload?: Record<string, unknown>;
    before?: Record<string, unknown>;
    [key: string]: unknown;
}

/**
 * Build and read the value context of flow chains, and resolve formulas against it.
 */
export const FlowContext = {
    values(test: SuccessTest): FlowTestValues {
        const data = test.data as SuccessTest['data'] & {
            force?: number, level?: number, values: { againstNetHits?: { value: number } }, marks?: number,
        };
        return {
            type: test.type,
            hits: test.hits.value,
            netHits: test.netHits.value,
            glitches: test.glitches.value,
            success: test.success,
            againstNetHits: data.values.againstNetHits?.value,
            force: data.force,
            level: data.level,
            marks: data.marks,
        };
    },

    /**
     * The values of an item formulas can read. Snapshot when the chain starts, so editing or
     * deleting the item doesn't change the chain.
     */
    item(item: SR5Item | undefined | null): Record<string, unknown> {
        if (!item) return {};
        const system = item.system as { rating?: number, technology?: { rating?: number }, force?: number, level?: number };
        return {
            name: item.name,
            uuid: item.uuid,
            type: item.type,
            rating: system.technology?.rating ?? system.rating ?? 0,
            force: system.force ?? 0,
            level: system.level ?? 0,
        };
    },

    damage(test: SuccessTest): FlowContextData['damage'] {
        const data = test.data as { modifiedDamage?: SuccessTest['data']['damage'] };
        const damage = data.modifiedDamage ?? test.data.damage;
        if (!damage) return undefined;
        return {
            value: damage.value,
            type: damage.type?.value ?? '',
            ap: damage.ap?.value ?? 0,
            element: damage.element?.value ?? '',
        };
    },

    /**
     * The context of a chain starting with the given root test.
     */
    forRoot(test: SuccessTest): FlowContextData {
        const values = FlowContext.values(test);
        return {
            item: FlowContext.item(test.item),
            primary: values,
            parent: values,
            nodes: { root: values },
            damage: FlowContext.damage(test),
        };
    },

    /**
     * The context of a branch continuing with the given test as the result of a step.
     */
    forChild(parent: FlowContextData, test: SuccessTest, stepId: string, primary = false): FlowContextData {
        const values = FlowContext.values(test);
        // A resisted chemical carries its Power left, as its effects read it. SR5#409.
        const chemical = test.data as SuccessTest['data'] & { payload?: Record<string, unknown>, power?: number };
        return {
            ...parent,
            primary: primary ? values : parent.primary,
            parent: values,
            nodes: { ...parent.nodes, [stepId]: values },
            damage: FlowContext.damage(test) ?? parent.damage,
            ...(chemical.payload ? { payload: { ...chemical.payload, power: chemical.power ?? chemical.payload.power } } : {}),
        };
    },

    /**
     * The context stored on a chat message, if any.
     */
    fromMessage(uuid: string | undefined): FlowContextData | undefined {
        if (!uuid) return undefined;
        const message = (uuid.includes('.') ? fromUuidSync(uuid) : game.messages?.get(uuid)) as ChatMessage | null | undefined;
        const state = message?.getFlag(SYSTEM_NAME, FLAGS.Flow) as FlowState | undefined;
        return state?.ctx as FlowContextData | undefined;
    },

    /**
     * The damage a step works with, as its damage mode says. See FlowDamageMode.
     *
     * - incoming / taken: the damage the parent test passes on. After a resist test that's the damage
     *   it let through, which is the damage taken.
     * - own: the damage of the steps node. Its formula reads the value context.
     * - none: no damage.
     *
     * The step scale applies last, rounding as configured. Like a rigger resisting half the damage
     * the vehicle took, rounded up. SR5#266.
     */
    stepDamage(step: FlowStep, parent: SuccessTest | undefined, ctx: FlowContextData = {}): DamageType | undefined {
        let damage: DamageType | undefined;
        switch (step.damage.mode) {
            case 'incoming':
            case 'taken': {
                const data = parent?.data as { modifiedDamage?: DamageType, damage?: DamageType } | undefined;
                damage = data?.modifiedDamage ?? data?.damage;
                break;
            }
            case 'own': {
                const own = step.settings.damage as DamageType | undefined;
                if (!own) break;
                damage = foundry.utils.deepClone(own);
                const formula = (own as DamageType & { formula?: string }).formula;
                if (formula) {
                    const value = FlowContext.resolve(formula, { ...ctx, ...(parent ? { parent: FlowContext.values(parent) } : {}) });
                    if (value !== undefined) damage.base = damage.value = value;
                }
                break;
            }
        }
        if (!damage) return undefined;

        damage = foundry.utils.deepClone(damage);
        const { factor, round } = step.damage;
        if (factor !== 1) {
            const scaled = damage.value * factor;
            damage.base = damage.value = round === 'down' ? Math.floor(scaled) : Math.ceil(scaled);
            damage.changes = [];
        }
        return damage;
    },

    /**
     * Resolve a formula against the given sources. `@path` reads from the sources, `1d6` style dice
     * are rolled once.
     *
     * @returns The resulting number, or undefined for empty or invalid formulas.
     */
    resolve(formula: string | undefined, source: Record<string, unknown>): number | undefined {
        if (!formula?.trim()) return undefined;

        // Synchronous Roll evaluation ignores dice, so roll them with the configured random source.
        const rolled = formula.replace(/(?<![\w.@])(\d*)d(\d+)\b/g, (_match, count: string, faces: string) => {
            let total = 0;
            for (let die = 0; die < Number(count || 1); die++) total += Math.ceil(CONFIG.Dice.randomUniform() * Number(faces));
            return String(total);
        });

        const value = DynamicValueEvaluator.evaluate(rolled, path => foundry.utils.getProperty(source, path));
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            console.warn(`Shadowrun 5e | Flow formula '${formula}' doesn't resolve to a number`, source);
            return undefined;
        }
        return value;
    },
};
