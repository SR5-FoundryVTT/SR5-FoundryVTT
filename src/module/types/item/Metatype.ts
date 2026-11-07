import { BaseItemData, ItemBase } from "./ItemBase";
const { ArrayField, DocumentUUIDField, NumberField, ObjectField, SchemaField, StringField } = foundry.data.fields;

export interface AttributeRange {
    min?: number;
    max?: number;
    aug_max?: number;
}

export interface MetatypeTaxonomyEntry {
    name: string;
    label: string;
}

export interface MetatypeTaxonomy {
    metatype: MetatypeTaxonomyEntry;
    subtype: MetatypeTaxonomyEntry;
    subsubtype: MetatypeTaxonomyEntry;
}

const TaxonomyEntryField = (initialName = '', initialLabel = '') =>
    new SchemaField({
        name: new StringField({ required: true, nullable: false, blank: true, initial: initialName }),
        label: new StringField({ required: true, nullable: false, blank: true, initial: initialLabel }),
    });

export const MetatypeData = () => ({
    ...BaseItemData(),

    // Parent baseline metatype category: human, elf, dwarf, ork, troll, or custom/imported string
    metatype: new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: 'human',
    }),
    // Subtype category (metahuman, metasapient, shapeshifter, infected, critter, spirit, sprite, other)
    subtype: new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: 'metahuman',
    }),
    // Specific sub-sub-type (species, strain, animal form, spirit type, sprite type)
    subsubtype: new StringField({
        required: false,
        nullable: true,
        blank: true,
        initial: '',
    }),
    // Canonical { name, label } pairs for metatype, subtype, and subsubtype
    taxonomy: new SchemaField({
        metatype: TaxonomyEntryField('human', ''),
        subtype: TaxonomyEntryField('metahuman', ''),
        subsubtype: TaxonomyEntryField('', ''),
    }),
    // Karma cost for this metavariant / metatype
    karma: new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0,
        min: 0,
    }),
    // Attribute min / max / aug_max ranges for this metatype (body, agility, etc.)
    attributes: new ObjectField<foundry.data.fields.DataField.Options<Record<string, AttributeRange>>, Record<string, AttributeRange>, Record<string, AttributeRange>>({
        required: true,
        nullable: false,
        initial: {},
    }),
    // Granted quality UUIDs
    qualities: new ArrayField(new DocumentUUIDField({ required: true, nullable: false })),
    // Granted natural or special weapon UUIDs
    weapons: new ArrayField(new DocumentUUIDField({ required: true, nullable: false })),
    // Granted other item UUIDs
    items: new ArrayField(new DocumentUUIDField({ required: true, nullable: false })),
});

export class Metatype extends ItemBase<ReturnType<typeof MetatypeData>> {
    static override defineSchema() {
        return MetatypeData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Metatype", "SR5.Item"];

    static override cleanData(
        ...[source, ...rest]: Parameters<typeof ItemBase['cleanData']>
    ): ReturnType<typeof ItemBase['cleanData']> {
        if (source && typeof source === 'object') {
            const src = source as Record<string, unknown>;
            const taxonomy = (src.taxonomy && typeof src.taxonomy === 'object' ? { ...(src.taxonomy as Record<string, unknown>) } : {}) as Record<string, MetatypeTaxonomyEntry>;

            for (const key of ['metatype', 'subtype', 'subsubtype'] as const) {
                const rawVal = src[key];
                const existingTax = taxonomy[key];

                if (rawVal && typeof rawVal === 'object' && 'name' in rawVal) {
                    const entry = rawVal as Partial<MetatypeTaxonomyEntry>;
                    const name = String(entry.name ?? '').trim().toLowerCase();
                    const label = String(entry.label ?? '').trim();
                    src[key] = name;
                    taxonomy[key] = { name, label };
                } else if (typeof rawVal === 'string') {
                    const trimmed = rawVal.trim();
                    const name = trimmed.toLowerCase();
                    src[key] = name;
                    const hasMatchingTax = existingTax && typeof existingTax === 'object' && String(existingTax.name ?? '').trim().toLowerCase() === name;
                    if (!hasMatchingTax) {
                        taxonomy[key] = {
                            name,
                            label: trimmed !== name ? trimmed : '',
                        };
                    }
                }
            }

            if (Object.keys(taxonomy).length > 0) {
                src.taxonomy = taxonomy;
            }
        }
        return super.cleanData(source, ...rest);
    }

    /**
     * All attribute ranges defined on this metatype item.
     */
    getActiveAttributeRanges(): Record<string, AttributeRange> {
        return this.attributes ?? {};
    }

    /**
     * All granted UUIDs combined and deduplicated.
     */
    getAllGrantedUuids(): { qualities: string[]; weapons: string[]; items: string[]; all: string[] } {
        const qualities = Array.from(new Set(this.qualities ?? []));
        const weapons = Array.from(new Set(this.weapons ?? []));
        const items = Array.from(new Set(this.items ?? []));
        const all = Array.from(new Set([...qualities, ...weapons, ...items]));
        return { qualities, weapons, items, all };
    }
}
