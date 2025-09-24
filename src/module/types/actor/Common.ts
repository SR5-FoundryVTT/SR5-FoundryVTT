import { ModifiableValue } from "../template/Base";
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

/**
 * Characters include extra configuration options not on all actor types
 * @constructor
 */
export const CharacterValues = () => ({
    ...PhysicalCombatValues(),
    control_rig_rating: new ModifiableField(ModifiableValue()),
})

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
    showAll: new BooleanField({ initial: false }),
    label: new StringField({ required: true }),
});

export const CommonData = () => ({
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

export abstract class ActorBase<DS extends ReturnType<typeof CommonData>> extends foundry.abstract.TypeDataModel<DS, Actor.Implementation> {}
