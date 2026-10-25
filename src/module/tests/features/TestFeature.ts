import type { SuccessTest } from "../SuccessTest";

/**
 * The stages of a test a feature can take part in, in execution order.
 */
export const TEST_STAGES = ['prepareDocuments', 'prepareValues', 'consume', 'process'] as const;
export type TestStage = typeof TEST_STAGES[number];

/**
 * Outcome values a feature can decide for a test.
 */
export interface TestFeatureOutcome {
    success: boolean;
    canSucceed: boolean;
    canFail: boolean;
}

/**
 * A reusable part of test behavior, like a blast template, drain or armor soak.
 *
 * Test kinds list the features they use. Action nodes can add or remove features for a single use,
 * e.g. `+touchOnly` on a melee attack. A feature only implements the stages it takes part in.
 */
export interface TestFeature {
    id: string;
    /** Feature ids that must run before this one within the same stage. */
    after?: string[];
    /** Complete the test data, once the test is created. */
    prepareData?(test: SuccessTest): void;
    /** Load documents or derive data from them, after the tests own document data is prepared. */
    prepareDocuments?(test: SuccessTest): Promise<void>;
    /** Add test modifiers, after the test kind added its own. Runs every time base values are prepared. */
    prepareTestModifiers?(test: SuccessTest): void;
    /** Add pool, limit or threshold parts. Runs every time base values are prepared. */
    prepareValues?(test: SuccessTest): void;
    /** Warn about values the user should check, after the test kind validated its own. */
    validate?(test: SuccessTest): void;
    /** Consume resources. Returning false stops the test. */
    consume?(test: SuccessTest): Promise<boolean>;
    /** Decide outcome values. Must not read the outcome getters of the test it decides for. */
    outcome?(test: SuccessTest): Partial<TestFeatureOutcome>;
    /** Alter results after the test has been evaluated, like damage modification. */
    process?(test: SuccessTest): Promise<void>;
    /** Template partial rendered into the tests chat message. */
    chat?: { partial: string };
    /** Disallow Edge rules for tests using this feature. */
    edge?: { secondChance?: false; pushTheLimit?: false };
}

/**
 * All known test features by id, open to modules.
 */
export const TestFeatures: Record<string, TestFeature> = {};

export const TestFeatureRules = {
    /**
     * Apply feature changes of an action node to the features of a test kind.
     *
     * @param base Feature ids of the test kind.
     * @param changes Feature ids prefixed with + to add or - to remove. Unprefixed ids are added.
     */
    resolveIds(base: readonly string[], changes: readonly string[] = []): string[] {
        const ids = [...base];
        for (const change of changes) {
            const remove = change.startsWith('-');
            const id = change.replace(/^[+-]/, '');
            const index = ids.indexOf(id);
            if (remove && index !== -1) ids.splice(index, 1);
            if (!remove && index === -1) ids.push(id);
        }
        return ids;
    },

    /**
     * Resolve feature ids to registered features, ordered by their `after` dependencies.
     *
     * Unknown ids are reported and left out. Dependencies on features not in use are ignored.
     */
    resolve(ids: readonly string[]): TestFeature[] {
        const features = ids
            .map(id => {
                const feature = TestFeatures[id];
                if (!feature) console.error(`Shadowrun 5e | Unknown test feature ${id}`);
                return feature;
            })
            .filter((feature): feature is TestFeature => !!feature);

        const sorted: TestFeature[] = [];
        const visiting = new Set<string>();
        const visit = (feature: TestFeature) => {
            if (sorted.includes(feature) || visiting.has(feature.id)) return;
            visiting.add(feature.id);
            for (const dependency of feature.after ?? []) {
                const before = features.find(other => other.id === dependency);
                if (before) visit(before);
            }
            sorted.push(feature);
        };
        features.forEach(visit);

        return sorted;
    },
};
