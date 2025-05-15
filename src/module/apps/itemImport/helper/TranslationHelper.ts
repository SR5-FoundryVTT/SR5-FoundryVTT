import { ImportHelper as IH } from "./ImportHelper";

const translationTypes = [
    'accessory', 'active', 'age', 'armor', 'art', 'bioware', 'book', 'category', 'complexform',
    'contact', 'cyberware', 'drainattribute', 'drugcomponent', 'echo', 'enhancement', 'gear',
    'gender', 'grade', 'hobbyvice', 'improvement', 'license', 'lifestyle', 'limb', 'martialart',
    'mentor', 'metamagic', 'metatype', 'mod', 'pdfargument', 'personallife', 'power', 'preferredpayment',
    'priority', 'program', 'quality', 'range', 'setting', 'skill', 'skillgroup', 'spell',
    'spirit', 'technique', 'tradition', 'type', 'vehicle', 'weapon', 'weaponmount'
] as const;

export type TranslationType = typeof translationTypes[number];

type TranslationOption = { type?: TranslationType; id?: string; };
type TranslationEntry = { name: string; translate: string; altpage?: string; type: TranslationType; id?: string; };

export class TranslationHelper {
    private static translationMap: Record<string, any> = {};

    public static ParseTranslation(jsonObject: any): void {
        if (!jsonObject?.chummer?.[0]?.$?.file) return;

        this.translationMap = {};
        const types = new Set<string>();

        jsonObject['chummer'].flatMap(file => {
            if (typeof file !== 'object' || file === null) return [];
            if (file?.$?.file && file.$.file === 'spiritpowers.xml') return [];

            return Object.values(file).flatMap(secondLevel => {
                if (typeof secondLevel !== 'object' || secondLevel === null) return [];
        
                return Object.entries(secondLevel).flatMap(([key, thirdLevel]) => {
                    if (typeof thirdLevel !== 'object' || thirdLevel === null) return [];
        
                    return IH.getArray(thirdLevel)
                        .filter(item => typeof item === 'object')
                        .map(item => ({
                            ...(item ?? {}),
                            type: key === 'name' ? 'skillgroup' : key,
                            ...(typeof item === 'object' ? ((item as { $?: object })?.$ ?? {}) : {}),
                        }));
                });
            });
        })
        .map(entry => ({
            name: entry?._TEXT || entry.name?._TEXT || undefined,
            translate: entry?.translate?._TEXT || entry?.translate || undefined,
            type: entry.type,
            altpage: entry?.altpage?._TEXT || entry?.altpage || undefined ,
            id: entry?.id?._TEXT || entry?.id || undefined ,
        }))
        .filter(entry => entry.name && entry.translate)
        .forEach(({ name, ...item}) => {
            types.add(item.type);
            if (!this.translationMap[name])
                this.translationMap[name] = item;
            else if (Array.isArray(this.translationMap[name]))
                this.translationMap[name].push(item);
            else
                this.translationMap[name] = [this.translationMap[name], item];
        });
    }

    private static getTranslationEntry(
        name: string,
        options?: TranslationOption,
        strict: boolean = false
    ): TranslationEntry | undefined {
        const values = this.translationMap[name] as undefined | TranslationEntry | TranslationEntry[];
    
        if (!values) return undefined;
        if (!Array.isArray(values)) return values;
    
        return (
            (options?.id && values.find(v => v.id === options.id)) ||
            (options?.type && values.find(v => v.type === options.type)) ||
            !strict && values[0] || undefined
        );
    }

    public static getTranslation(
        name: string,
        options?: TranslationOption,
        strict: boolean = false
    ): string {
        const entry = this.getTranslationEntry(name, options, strict);
        return entry?.translate ?? name;
    }

    public static getAltPage(
        name: string,
        fallback: string,
        options?: TranslationOption,
        strict: boolean = false
    ): string {
        const entry = this.getTranslationEntry(name, options, strict);
        return entry?.altpage ?? fallback;
    }
    
}
