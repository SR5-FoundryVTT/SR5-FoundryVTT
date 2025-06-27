import { DescriptionData } from "../template/Description";
import { ImportFlagData } from "../template/ImportFlags";
import { TechnologyData } from "../template/Technology";
import { ActionRollData } from "./Action";
import { ArmorValueData } from "./Armor";
const { SchemaField } = foundry.data.fields;
type AnyMutableObject = Record<string, unknown>;
type DataSchema = foundry.data.fields.DataSchema;


const BaseData = () => ({
    // Description and ImportFlags are common to all items
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),

    // Technology, Action and Armor are reused in many items
    // but not all items have them, so they are optional
    armor: new SchemaField(ArmorValueData()),
    action: new SchemaField(ActionRollData()),
    technology: new SchemaField(TechnologyData()),
});
type BaseType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof BaseData>>;

/**
 * A reusable abstract base class for item data models that provides common schema fields
 * (e.g., description, import flags, technology, action, and armor) along with migration helpers.
 *
 * Subclasses should extend this class to inherit default schema structure and standardized
 * data migration logic for shared item properties across the system.
 */
export abstract class ItemBase<DS extends DataSchema> extends foundry.abstract.TypeDataModel<DS, Item.Implementation> {
    static override migrateData(source: AnyMutableObject) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        // Migrate the base data schema
        const result = source as BaseType;

        return super.migrateData(result);
    }
}
