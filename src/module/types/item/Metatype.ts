import { SR5 } from "@/module/config";
import { BaseItemData, ItemBase } from "./ItemBase";
const { ArrayField, DocumentUUIDField, NumberField, ObjectField, StringField } = foundry.data.fields;

export interface AttributeRange {
    min?: number;
    max?: number;
    aug_max?: number;
}

export const MetatypeData = () => ({
    ...BaseItemData(),

    // Parent baseline metatype category: human, elf, dwarf, ork, troll, or custom module-expanded
    metatype: new StringField({
        required: true,
        nullable: false,
        initial: 'human',
        choices: () => CONFIG.SR5?.metatypes ?? SR5.metatypes,
    }),
    // Subtype category (metahuman, metasapient, shapeshifter, infected, critter, spirit, sprite, other)
    subtype: new StringField({
        required: true,
        nullable: false,
        initial: 'metahuman',
        choices: () => CONFIG.SR5?.metaSubtypes ?? SR5.metaSubtypes,
    }),
    // Specific sub-sub-type (species, strain, animal form, spirit type, sprite type)
    subsubtype: new StringField({
        required: false,
        nullable: true,
        initial: '',
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
