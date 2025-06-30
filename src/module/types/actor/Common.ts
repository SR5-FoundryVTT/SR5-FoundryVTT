import { SystemData } from "../template/System";
import { ModifiableValue } from "../template/Base";
import { AnyMutableObject } from "fvtt-types/utils";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
import { ModifiableField } from "../fields/ModifiableField";
import { Limits, AwakendLimits, MatrixLimits } from "../template/Limits";
import { KnowledgeSkillList, KnowledgeSkills, Skills } from "../template/Skills";
const { SchemaField, NumberField, BooleanField, ObjectField, ArrayField, StringField, TypedObjectField } = foundry.data.fields;

export const CharacterSkills = () => ({
    active: Skills(),
    language: new SchemaField(KnowledgeSkillList('intuition')),
    knowledge: new SchemaField(KnowledgeSkills()),
});


export const MagicData = () => ({
    attribute: new StringField({ required: true, initial: "logic" }), // Drain attribute
    projecting: new BooleanField(),
    initiation: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

export const PhysicalCombatValues = () => ({
    recoil: new ModifiableField(ModifiableValue()),
    recoil_compensation: new ModifiableField(ModifiableValue()),
});

export const CharacterLimits = () => ({
    ...Limits(),
    ...AwakendLimits(),
    ...MatrixLimits(),
});

export const CreateModifiers = <T extends readonly string[]>(...keys: T) => {
    const field = () => new NumberField({ required: true, nullable: false, integer: true, initial: 0 });
    return Object.fromEntries(
        keys.map(modifier => [modifier, field()])
    ) as { [K in T[number]]: ReturnType<typeof field> };
};

const InventoryData = () => ({
    name: new StringField({ required: true }),
    type: new StringField({ required: true }),
    itemIds: new ArrayField(new StringField({ required: true })),
    showAll: new BooleanField(),
    label: new StringField({ required: true }),
});

export const CommonData = () => ({
    system: new SchemaField(SystemData()),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),

    skills: new SchemaField(CharacterSkills()),

    situation_modifiers: new SchemaField({
        environmental: new SchemaField({ active: new ObjectField({ initial: {} }) }),
        noise: new SchemaField({ active: new ObjectField({ initial: {} }) }),
        background_count: new SchemaField({ active: new ObjectField({ initial: {} }) }),
    }),
    inventories: new TypedObjectField(
        new SchemaField(InventoryData()),
        { initial: { "All": { name: "All", type: "all", itemIds: [], showAll: true, label: "SR5.Labels.Inventory.All" } } }
    ),
    category_visibility: new SchemaField(
        { default: new BooleanField({ initial: true }) }
    ),
});

export type InventoryType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof InventoryData>>;

export abstract class ActorBase<DS extends ReturnType<typeof CommonData>> extends foundry.abstract.TypeDataModel<DS, Actor.Implementation> {
    static override migrateData(source: AnyMutableObject) {
        if (!source || typeof source !== "object" || Object.keys(source).length === 0)
            return super.migrateData(source);

        ActorBase.migrateWithSchema(source, this.schema);
        return super.migrateData(source);
    }

    static migrateWithSchema(source: AnyMutableObject, schema: foundry.data.fields.SchemaField.Any) {
        for (const [fieldName, field] of Object.entries(schema)) {
            const value = source[fieldName];
            if (!field.validate(value)) {
                if (field instanceof SchemaField && value && typeof value === "object") {
                    ActorBase.migrateWithSchema(value as AnyMutableObject, field);
                } else {
                    source[fieldName] = field.getInitialValue();
                }
            }
        }
    }
}
