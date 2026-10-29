import type { SuccessTest } from "@/module/tests/SuccessTest";
import type { SR5Item } from "@/module/item/SR5Item";
import type { FlowNodeData } from "./FlowTree";
import type { FlowStep } from "@/module/types/flows/FlowStep";
import type { ChemicalType } from "@/module/types/template/Chemical";
import type { SR5Actor } from "@/module/actor/SR5Actor";
import { FLAGS, SYSTEM_NAME } from "@/module/constants";

/**
 * Add nodes to, or change nodes of, the action node tree of a root test before it's flattened.
 *
 * Contributors work on a copy of the tree, never on the item data. They're how rules apply to
 * every action they concern without each item authoring them, like touch range spells.
 *
 * @param root The root test the chain starts with.
 * @param tree A copy of the roots action node tree to change.
 */
export type FlowContributor = (root: SuccessTest, tree: FlowNodeData) => void;

/**
 * The node tree a touch range power or spell adds before the defense of each target. SR5#173, SR5#187, SR5#281.
 *
 * The target chooses to accept or resist. Accepting releases the defense right away. Resisting
 * means the caster has to touch them: an unarmed attack, a touch-only attack (+2 dice), against
 * the targets defense. A hit or a grazing hit (tie) makes contact and releases the defense.
 */
export const touchTree = (): FlowNodeData => ({
    kind: 'choice',
    actor: 'same',
    releases: ['accept'],
    option: {
        accept: { test: '' },
        resist: {
            test: 'MeleeAttackTest',
            actor: 'other',
            mode: 'prompt',
            skill: 'unarmed_combat',
            attribute: 'agility',
            limit: { attribute: 'physical' },
            features: ['+touchOnly'],
            opposed: { test: 'PhysicalDefenseTest', releases: ['hit', 'tie'] },
        },
    },
});

/**
 * A node a defender adds to its own branch of a chain, below the step it defended with.
 */
export interface FlowBranchContribution {
    // The relation key the node attaches under, like followed.
    key: string;
    // Distinguishes the node from an authored one under the same key.
    name: string;
    node: FlowNodeData;
    // Shown with the node, like the defenders power.
    source: { kind: string, uuid: string, name?: string };
}

/**
 * Add nodes to the branch of one defender, when its defense is recorded. These depend on the
 * defending actor, so unlike plan contributors they can't run when the chain starts.
 *
 * @param test The finished test of the step, like a defense.
 * @param step The step the test is the result of.
 */
export type FlowBranchContributor = (test: SuccessTest, step: FlowStep) => FlowBranchContribution[];

/**
 * Branch contributors by name. Exposed on game.shadowrun5e.flow.branchContributors.
 */
export const FlowBranchContributors: Record<string, FlowBranchContributor> = {
    /**
     * Melee attacks hitting a critter with Energy Aura damage the attacker: Magic x 2 DV, AP -Magic,
     * resisted by the attacker. SR5#396 'Energy Aura'.
     */
    energyAura(test, step) {
        if (step.relation !== 'opposed' || !test.actor) return [];
        const against = (test as SuccessTest & { against?: SuccessTest }).against;
        if (!against?.hasTestCategory('attack_melee')) return [];

        const power = test.actor.items.find(item => item.isType('critter_power') && /energy aura/i.test(item.name));
        const magic = Number(test.actor.getAttribute('magic')?.value ?? 0);
        if (!power || magic <= 0) return [];

        return [{
            key: 'followed',
            name: 'energyAura',
            source: { kind: 'power', uuid: power.uuid, name: power.name },
            node: {
                test: 'PhysicalResistTest',
                actor: 'other',
                when: ['hit'],
                mode: 'prompt',
                damageMode: 'own',
                damage: {
                    base: magic * 2, value: magic * 2, changes: [], formula: '',
                    type: { base: 'physical', value: 'physical' },
                    ap: { base: -magic, value: -magic, changes: [] },
                },
            },
        }];
    },
};

/**
 * The node resisting a delivered chemical, then applying its damage and effects with the Power left.
 *
 * @param payload The chemical, as carried by an item or a loaded dose.
 * @param itemUuid The item holding the chemicals effects.
 */
export const chemicalTree = (payload: ChemicalType, itemUuid: string): FlowNodeData => {
    const vectors = payload.vectors ?? [];
    const contact = vectors.includes('contact');
    const injection = vectors.includes('injection');
    return {
        test: 'ToxinResistTest',
        actor: 'same',
        // Contact makes contact on a grazing hit as well.
        when: contact ? ['hit', 'tie'] : ['hit'],
        condition: injection && !contact ? 'dartPenetrates' : '',
        // Toxins take effect at the end of the Combat Turn, so the resist waits to be started. SR5#408.
        mode: 'prompt',
        config: {
            payload: foundry.utils.deepClone(payload),
            itemUuid,
            conditions: Object.fromEntries((payload.effects ?? []).filter(effect => effect.condition).map(effect => [effect.id, effect.condition])),
        },
        // Without a list of effects, all targeted actor effects of the item apply.
        effects: payload.effects?.length
            ? { select: 'ids', ids: payload.effects.map(effect => effect.id) }
            : { select: 'all', ids: [] },
    };
};

/**
 * Rules of drugs taken, as tracked by the effects they applied.
 */
export const FlowChemicals = {
    /**
     * The Power of an overdose taking a drug now: the sum of the Addiction Ratings of the drug and
     * of every drug in effect sharing an effect with it. Zero when not overdosing. SR5#415.
     */
    overdosePower(actor: SR5Actor, item: SR5Item, chemical: ChemicalType): number {
        const keys = new Set(item.effects.contents.flatMap(effect => (effect as unknown as { system: { changes: { key: string }[] } }).system.changes.map(change => change.key)));

        let ratings = 0;
        let overdosing = false;
        for (const effect of actor.effects) {
            if (effect.disabled || effect.duration?.expired) continue;
            const taken = foundry.utils.getProperty(effect.flags, `${SYSTEM_NAME}.${FLAGS.Chemical}`) as { itemUuid: string, addictionRating: number } | undefined;
            if (!taken) continue;

            const same = taken.itemUuid === item.uuid;
            const shared = (effect as unknown as { system: { changes: { key: string }[] } }).system.changes.some(change => keys.has(change.key));
            if (!same && !shared) continue;
            overdosing = true;
            ratings += Number(taken.addictionRating ?? 0);
        }
        return overdosing ? ratings + Number(chemical.addiction?.rating ?? 0) : 0;
    },
};

/**
 * Plan contributors by name, applied in order. Exposed on game.shadowrun5e.flow.contributors for
 * modules to add their own.
 */
export const FlowContributors: Record<string, FlowContributor> = {
    /**
     * Using a drug applies its effects to its user, no resistance roll. Taking it while already on it,
     * or on one sharing an effect, is an overdose: Stun damage of the sum of their Addiction Ratings,
     * resisted with Body + Willpower. SR5#410, SR5#415.
     */
    drug(root, tree) {
        if (!root.data.rollless || tree.followed && (tree.followed as FlowNodeData).test) return;
        const item = root.item;
        const actor = root.actor;
        const chemical = item?.asType('chemical')?.system as ChemicalType | undefined;
        if (!item || !actor || chemical?.kind !== 'drug') return;

        const use: FlowNodeData = {
            kind: 'applyEffects',
            actor: 'self',
            when: [],
            effects: { select: 'all', ids: [] },
            config: {
                conditions: Object.fromEntries((chemical.effects ?? []).filter(effect => effect.condition).map(effect => [effect.id, effect.condition])),
                durationFormula: chemical.duration?.formula ?? '',
                durationUnit: chemical.duration?.unit ?? 'hours',
                chemical: { itemUuid: item.uuid, addictionRating: chemical.addiction?.rating ?? 0 },
            },
        };

        const overdose = FlowChemicals.overdosePower(actor, item, chemical);
        if (overdose > 0) {
            use.resist = {
                test: 'ToxinResistTest',
                actor: 'same',
                when: [],
                mode: 'auto',
                config: { payload: { kind: 'drug', power: overdose, damageType: 'stun', vectors: [], effects: [], penetration: 0 } },
            };
        }
        tree.followed = use;
    },

    /**
     * A toxin or drug loaded as ammo is delivered by a hit. Contact needs contact, a grazing hit does.
     * Injection darts need to penetrate. SR5#173, SR5#408, SR5#434.
     */
    ammoPayload(root, tree) {
        const item = root.item ?? (root.data.sourceItemUuid ? fromUuidSync(root.data.sourceItemUuid) as SR5Item | null : null);
        const ammo = item?.getEquippedAmmo?.();
        const payload = ammo?.system.payload;
        if (!ammo || !payload?.kind) return;

        const opposed = tree.opposed as FlowNodeData | undefined;
        if (!opposed?.test || opposed.followed) return;
        opposed.followed = chemicalTree(payload, ammo.uuid ?? "");
    },

    /**
     * Everyone taking part in a ritual takes its drain, the leader and each participant. SR5#296.
     */
    ritualParticipants(root, tree) {
        if (root.type !== 'RitualSpellcastingTest') return;
        const followed = tree.followed as FlowNodeData | undefined;
        if (!followed?.test || followed.actor) return;
        followed.actor = 'participants';
    },

    /**
     * Spells and critter powers of touch range need contact with an unwilling target first. The
     * spell is cast, then each target accepts or has to be touched before defending against it.
     */
    touch(root, tree) {
        // Tests created from data have their item once their documents are populated.
        const item = root.item ?? (root.data.sourceItemUuid ? fromUuidSync(root.data.sourceItemUuid) as SR5Item | null : null);
        const range = (item?.system as { range?: string } | undefined)?.range;
        if (range !== 'touch') return;

        const opposed = tree.opposed as FlowNodeData | undefined;
        if (!opposed?.test || opposed.before) return;
        opposed.before = touchTree();
    },
};
