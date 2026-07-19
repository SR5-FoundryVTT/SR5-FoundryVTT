import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";
const { SchemaField, NumberField } = foundry.data.fields;

export const ContainerData = () => ({
    ...BaseItemData(),
    ...TechnologyPartData(),

    capacity: new SchemaField({
        count: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    }),
});

export class Container extends ItemBase<ReturnType<typeof ContainerData>> {
    static override defineSchema() {
        return ContainerData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Container", "SR5.Item"];
}

export type ContainerType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ContainerData>>;
