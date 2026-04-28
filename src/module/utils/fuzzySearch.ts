import Fuse from 'fuse.js';

export const FUZZY_BALANCED_THRESHOLD = 0.35;

const { SearchFilter } = foundry.applications.ux;

export interface FuzzySearchOptions {
    threshold?: number;
}

function normalize(value: string): string {
    return SearchFilter.cleanQuery(value).toLowerCase();
}

/**
 * Rank matches for a given query.
 * Results are returned in descending relevance order.
 */
export function getFuzzyMatches<T>(
    items: readonly T[],
    query: string,
    getTarget: (item: T) => string,
    options: FuzzySearchOptions = {},
) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
        return items.map(item => ({ item, score: 0 }));
    }

    const rankedTargets = items.map(item => ({ item, target: normalize(getTarget(item)) }));

    const fuse = new Fuse(rankedTargets, {
        includeScore: true,
        ignoreLocation: true,
        shouldSort: true,
        threshold: options.threshold ?? FUZZY_BALANCED_THRESHOLD,
        keys: ['target'],
    });

    return fuse.search(normalizedQuery).map(result => ({
        item: result.item.item,
        // Fuse score is 0 (best) to 1 (worst). Convert to higher-is-better relevance.
        score: 1 - (result.score ?? 1),
    }));
}

export function matchesFuzzyQuery(
    query: string,
    target: string,
    options: FuzzySearchOptions = {},
): boolean {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return true;

    return getFuzzyMatches([target], query, value => value, options).length > 0;
}
