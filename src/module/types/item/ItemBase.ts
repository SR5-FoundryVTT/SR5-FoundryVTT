import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { BooleanField, SchemaField, ArrayField, DocumentUUIDField, } = foundry.data.fields;

export const LinkedItemData = () => ({
    id: new DocumentUUIDField({ required: true, nullable: false }),
    attached: new BooleanField({ required: true, initial: false })
})

export const BaseItemData = () => ({
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
    // linked_items
    linked_items: new ArrayField(new SchemaField(LinkedItemData())),
});

/**
 * A reusable abstract base class for item data models that provides common schema fields
 * (e.g., description, import flags, technology, action, and armor) along with migration helpers.
 *
 * Subclasses should extend this class to inherit default schema structure and standardized
 * data migration logic for shared item properties across the system.
 */
export abstract class ItemBase<DS extends ReturnType<typeof BaseItemData>> extends foundry.abstract.TypeDataModel<DS, Item.Implementation> {}
