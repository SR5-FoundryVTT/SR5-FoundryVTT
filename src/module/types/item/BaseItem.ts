import { SystemData } from "../template/System";
import { AnyMutableObject } from "fvtt-types/utils"
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField } = foundry.data.fields;

export const BaseItemData = () => ({
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),
    system: new SchemaField(SystemData()),
});

/**
 * A reusable abstract base class for item data models that provides common schema fields
 * (e.g., description, import flags, technology, action, and armor) along with migration helpers.
 *
 * Subclasses should extend this class to inherit default schema structure and standardized
 * data migration logic for shared item properties across the system.
 */
export abstract class ItemBase<DS extends ReturnType<typeof BaseItemData>> extends foundry.abstract.TypeDataModel<DS, Item.Implementation> {
    static override migrateData(source: AnyMutableObject) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        return super.migrateData(source);
    }
}
