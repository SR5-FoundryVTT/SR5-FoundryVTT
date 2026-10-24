/**
 * Keys holding previous test data within test data.
 */
const NESTED_TEST_KEYS = ['against', 'following'] as const;

/**
 * Handle copies of test data carried along within other tests' data.
 *
 * Tests following another test (opposed, resist, followup) keep a copy of that tests data. Without
 * limiting how deep these copies go, each link of a chain carries the whole chain before it.
 */
export const FlowSnapshot = {
    /**
     * Create a copy of test data, keeping nested previous test data only up to the given depth.
     *
     * @param data The test data to copy.
     * @param depth How many levels of nested against / following data to keep. 0 keeps none.
     */
    prune<T extends object>(data: T, depth: number): T {
        const copy = foundry.utils.deepClone(data) as Record<string, unknown>;
        FlowSnapshot._pruneInPlace(copy, depth);
        return copy as T;
    },

    _pruneInPlace(data: Record<string, unknown>, depth: number) {
        delete data.flow;

        for (const key of NESTED_TEST_KEYS) {
            const nested = data[key];
            if (!nested || typeof nested !== 'object') continue;

            if (depth <= 0) delete data[key];
            else FlowSnapshot._pruneInPlace(nested as Record<string, unknown>, depth - 1);
        }
    },

    /**
     * Count how many levels of nested previous test data the given test data holds.
     */
    depth(data: object | undefined): number {
        if (!data || typeof data !== 'object') return 0;
        const record = data as Record<string, unknown>;
        let deepest = 0;
        for (const key of NESTED_TEST_KEYS) {
            const nested = record[key];
            if (nested && typeof nested === 'object') deepest = Math.max(deepest, 1 + FlowSnapshot.depth(nested));
        }
        return deepest;
    },
};
