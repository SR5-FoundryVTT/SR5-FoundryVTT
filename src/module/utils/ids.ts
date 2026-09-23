const ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * A 16 character document id hashed from a seed, built from two 53 bit cyrb53 hashes.
 *
 * Unlike a random id, writing the same data twice lands on the same id, so a repeated write
 * replaces what the previous one stored instead of adding a copy beside it.
 */
export function deterministicId(seed: string): string {
    let id = '';
    for (const salt of [0, 0x9e3779b9]) {
        let hash = cyrb53(seed, salt);
        for (let i = 0; i < 8; i++) {
            id += ID_ALPHABET[hash % ID_ALPHABET.length];
            hash = Math.floor(hash / ID_ALPHABET.length);
        }
    }
    return id;
}

/**
 * Id for a child derived from its parent's id and a key naming the child, unique within usedIds.
 *
 * The parent is part of the seed, so the same child under two parents gets two ids.
 */
export function derivedChildId(parentId: string, key: string, usedIds: Set<string>): string {
    let id = deterministicId(`${parentId}:${key}`);
    for (let attempt = 1; usedIds.has(id); attempt++) {
        id = deterministicId(`${parentId}:${key}:${attempt}`);
    }
    usedIds.add(id);
    return id;
}

function cyrb53(value: string, seed: number): number {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        h1 = Math.imul(h1 ^ char, 2654435761);
        h2 = Math.imul(h2 ^ char, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
