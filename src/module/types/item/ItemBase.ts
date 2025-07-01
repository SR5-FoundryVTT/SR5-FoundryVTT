import { ImportFlagData } from "../template/ImportFlags";
import { SanitizedModel } from "../fields/SanitizedModel";
import { DescriptionData } from "../template/Description";
const { SchemaField } = foundry.data.fields;

export const BaseItemData = () => ({
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
});

/**
 * A reusable abstract base class for item data models that provides common schema fields
 * (e.g., description, import flags, technology, action, and armor) along with migration helpers.
 *
 * Subclasses should extend this class to inherit default schema structure and standardized
 * data migration logic for shared item properties across the system.
 */
export abstract class ItemBase<DS extends ReturnType<typeof BaseItemData>> extends SanitizedModel<DS, Item.Implementation> {}
