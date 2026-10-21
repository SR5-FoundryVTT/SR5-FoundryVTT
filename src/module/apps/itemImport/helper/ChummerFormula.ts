import { DynamicValueEvaluator } from '@/module/effect/DynamicValueEvaluator';
import type { AvailabilityRestriction } from '@/module/item/flows/ItemAvailabilityFlow';

export interface ChummerFormula {
    value: string;
    /** A restriction, or a rating lookup expression for one. */
    restriction?: string;
}

export interface ChummerFormulaOptions {
    availability?: boolean;
    minRating?: number;
    /** Chummer identifiers the item itself can resolve, mapped to their `@` data path. */
    identifiers?: Record<string, string>;
}

/** Translate the subset of Chummer expressions that item effects can evaluate. */
export class ChummerFormulaParser {
    static readonly RATING = '@system.technology.rating';

    /** Chummer names for values of the item a modification sits in. */
    static readonly PARENT_ITEM = {
        'Weapon Cost': '@parent.system.technology.cost.base',
        'Armor Cost': '@parent.system.technology.cost.base',
        Capacity: '@parent.system.capacity.total',
    };

    /** Chummer names for values of the vehicle a vehicle modification belongs to. */
    static readonly VEHICLE = {
        'Vehicle Cost': '@actor.system.cost',
        Body: '@actor.system.attributes.body.base',
        Armor: '@actor.system.armor.rating.base',
        Speed: '@actor.system.vehicle_stats.speed.base',
        Handling: '@actor.system.vehicle_stats.handling.base',
        Acceleration: '@actor.system.vehicle_stats.acceleration.base',
        Sensor: '@actor.system.vehicle_stats.sensor.base',
    };

    /** Whether a value is an expression rather than a plain number, counting the given identifiers as expressions. */
    static isFormula(value: string, identifiers: Record<string, string> = {}): boolean {
        if (Object.keys(identifiers).some(identifier => new RegExp(`\\b${identifier}\\b`).test(value))) return true;
        return /FixedValues\s*\(|\{?Rating\}?|[+*/()]/i.test(value) && !/^\s*[+-]?\d+(?:\.\d+)?[RF]?\s*$/i.test(value);
    }

    /** A leading sign marks a value that Chummer adds to the parent item instead of the item's own value. */
    static isRelative(value: string): boolean {
        return /^\s*\[?\s*[+-]/.test(value);
    }

    /** Split Chummer capacity into the item's own capacity and the bracketed capacity it uses in its parent. */
    static splitCapacity(value: string): { own?: string; used?: string } {
        const source = value.trim();
        const both = /^(.*?)\s*\/\s*\[(.*)\]$/.exec(source);
        if (both) return { own: both[1].trim(), used: both[2].trim() };
        const used = /^\[(.*)\]$/.exec(source);
        if (used) return { used: used[1].trim() };
        return { own: source };
    }

    /** Capacity a modification uses in its parent: the bracketed part, or the whole value without brackets. */
    static usedCapacity(value: string): string {
        const { own, used } = this.splitCapacity(value);
        return used ?? own ?? '';
    }

    /** Keep the first of text alternatives, like '12R or Gear'. */
    static firstAlternative(value: string): string {
        return value.split(/\s+or\s+/i)[0].trim();
    }

    /** Lower bound of a user chosen Variable(min-max) range. */
    static variableMinimum(value: string): number | undefined {
        const match = /^\s*Variable\(\s*(\d+(?:\.\d+)?)\s*-/i.exec(value);
        return match ? Number(match[1]) : undefined;
    }

    static parse(value: string, options: ChummerFormulaOptions = {}): ChummerFormula | null {
        const source = value.trim();
        const fixed = /^FixedValues\((.*)\)$/is.exec(source);
        const entries = fixed ? this.splitEntries(fixed[1]) : [source];
        if (!entries.length) return null;

        const parsed = entries.map(entry => this.parseEntry(entry, options));
        if (parsed.some(entry => !entry)) return null;
        const values = parsed as { value: string; restriction: AvailabilityRestriction }[];

        if (!fixed) return {
            value: values[0].value,
            ...(options.availability ? { restriction: values[0].restriction } : {}),
        };

        const index = `min(max(${this.RATING} - 1, 0), ${values.length - 1})`;
        const result: ChummerFormula = { value: `[${values.map(entry => entry.value).join(',')}][${index}]` };
        if (options.availability) {
            const restrictions = values.map(entry => entry.restriction);
            result.restriction = restrictions.every(restriction => restriction === restrictions[0])
                ? restrictions[0]
                : `[${restrictions.map(restriction => `'${restriction}'`).join(',')}][${index}]`;
        }
        return result;
    }

    /** Translate one Chummer value into an effect expression, or null when effects can't evaluate it. */
    private static parseEntry(raw: string, options: ChummerFormulaOptions) {
        const { entry, restriction } = this.splitRestriction(raw, options.availability);
        if (/\bMinRating\b/i.test(entry) && options.minRating == null) return null;

        // Longer names first, so 'Armor Cost' isn't read as 'Armor'.
        const identifiers = Object.entries(options.identifiers ?? {}).sort(([a], [b]) => b.length - a.length);
        const value = this.translate(entry, options.minRating, identifiers);
        if (!this.isSafe(value, identifiers.map(([, path]) => path)) || !this.evaluates(value)) return null;
        return { value, restriction };
    }

    /** Remove an entry's brackets and, for an availability, its R or F suffix as the restriction. */
    private static splitRestriction(raw: string, availability = false): { entry: string; restriction: AvailabilityRestriction } {
        let entry = raw.trim();
        if (/^\[.*\]$/.test(entry)) entry = entry.slice(1, -1);
        const suffix = availability ? /[RF]$/i.exec(entry)?.[0] : undefined;
        if (!suffix) return { entry, restriction: 'none' };
        return {
            entry: entry.slice(0, -1).trim(),
            restriction: suffix.toUpperCase() === 'F' ? 'forbidden' : 'restricted',
        };
    }

    /** Rewrite Chummer names and syntax as effect references and operators. */
    private static translate(entry: string, minRating: number | undefined, identifiers: [string, string][]): string {
        let value = entry
            .replace(/\{Rating\}/gi, 'Rating')
            .replace(/\bRating\b/gi, this.RATING)
            .replace(/\bMinRating\b/gi, String(minRating))
            // Chummer's number(predicate) casts a comparison to 0 or 1.
            .replace(/number\(([^()]*)\)/gi, (_match, predicate: string) =>
                `((${predicate.replace(/(?<![=!<>])=(?!=)/g, '==')}) ? 1 : 0)`)
            .replace(/\bmod\b/g, '%');
        // A reference to a missing document, like the parent of a compendium item, counts as 0.
        for (const [identifier, path] of identifiers)
            value = value.replace(new RegExp(`\\b${identifier}\\b`, 'g'), `(${path} ?? 0)`);
        return value;
    }

    /** Whether an expression uses only arithmetic, min, max and the given references, so no other Chummer field or function passes through. */
    private static isSafe(value: string, references: string[]): boolean {
        if (!/^[\d\s@.\w+*/%()?:<>=!&|,-]+$/.test(value)) return false;
        const rest = [this.RATING, ...references].reduce((text, reference) => text.split(reference).join(''), value);
        return (rest.match(/\b[A-Za-z_]\w*\b/g) ?? []).every(name => ['min', 'max'].includes(name));
    }

    /** Whether an expression resolves to a finite number at a few ratings, with every other reference as 1. */
    private static evaluates(value: string): boolean {
        return [1, 2, 6].every(rating => {
            const resolved = DynamicValueEvaluator.evaluate(value, path =>
                path === 'system.technology.rating' ? rating : 1);
            return typeof resolved === 'number' && Number.isFinite(resolved);
        });
    }

    private static splitEntries(source: string): string[] {
        const entries: string[] = [];
        let depth = 0;
        let start = 0;
        for (let i = 0; i < source.length; i++) {
            if (source[i] === '(') depth++;
            else if (source[i] === ')') depth--;
            else if (source[i] === ',' && depth === 0) {
                entries.push(source.slice(start, i).trim());
                start = i + 1;
            }
            if (depth < 0) return [];
        }
        if (depth !== 0) return [];
        entries.push(source.slice(start).trim());
        return entries.filter(Boolean);
    }
}
