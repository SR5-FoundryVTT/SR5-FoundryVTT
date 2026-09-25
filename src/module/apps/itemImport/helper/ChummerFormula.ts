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

    static isFormula(value: string): boolean {
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

    /** Name the missing context of an expression that can't be parsed. */
    static classify(value: string, options: ChummerFormulaOptions = {}): string {
        if (/\b(?:Gear|Children)\s+Cost\b/i.test(value)) return 'requires child item';
        if (/\b(?:Weapon|Parent|Armor|Vehicle)\s+Cost\b/i.test(value)) return 'requires parent item';
        if (/\b(?:Body|Speed|Handling|Acceleration|Armor|Sensor)\b/.test(value)) return 'requires vehicle stats';
        if (/\bMinRating\b/i.test(value) && options.minRating == null) return 'requires metatype minimum';
        if (/\bCapacity\b/.test(value)) return 'requires parent capacity';
        if (/^\s*Variable\(/i.test(value)) return 'user choice (base set to minimum)';
        if (/^\s*\[?\s*\*\s*\]?\s*$/.test(value)) return 'wildcard';
        return 'unsupported expression';
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

    private static parseEntry(raw: string, options: ChummerFormulaOptions) {
        let entry = raw.trim();
        if (/^\[.*\]$/.test(entry)) entry = entry.slice(1, -1);
        let restriction: AvailabilityRestriction = 'none';
        if (options.availability && /[RF]$/i.test(entry)) {
            restriction = /f$/i.test(entry) ? 'forbidden' : 'restricted';
            entry = entry.slice(0, -1).trim();
        }
        entry = entry.replace(/\{Rating\}/gi, 'Rating');
        entry = entry.replace(/\bRating\b/gi, this.RATING);
        if (/\bMinRating\b/i.test(entry)) {
            if (options.minRating == null) return null;
            entry = entry.replace(/\bMinRating\b/gi, String(options.minRating));
        }
        const paths = Object.entries(options.identifiers ?? {});
        for (const [identifier, path] of paths)
            entry = entry.replace(new RegExp(`\\b${identifier}\\b`, 'g'), path);
        // Chummer's number(predicate) casts a comparison to 0 or 1.
        entry = entry.replace(/number\(([^()]*)\)/gi, (_match, predicate: string) =>
            `((${predicate.replace(/(?<![=!<>])=(?!=)/g, '==')}) ? 1 : 0)`);
        if (!/^[\d\s@.\w+*/%()?:<>=!&|,-]+$/.test(entry)) return null;
        // Whitelist identifiers; no arbitrary Chummer field or function may pass through.
        const references = [this.RATING, ...paths.map(([, path]) => path)];
        const identifiers = references.reduce((rest, path) => rest.split(path).join(''), entry)
            .match(/\b[A-Za-z_]\w*\b/g) ?? [];
        if (identifiers.some(identifier => !['min', 'max'].includes(identifier))) return null;
        for (const rating of [1, 2, 6]) {
            const resolved = DynamicValueEvaluator.evaluate(entry, path =>
                path === 'system.technology.rating' ? rating : 1);
            if (typeof resolved !== 'number' || !Number.isFinite(resolved)) return null;
        }
        return { value: entry, restriction };
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
