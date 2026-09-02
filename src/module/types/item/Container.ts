import { BaseItemData, ItemBase } from "./ItemBase";
import { TechnologyPartData } from "../template/Technology";

export const ContainerData = () => ({
    ...BaseItemData(),
    ...TechnologyPartData(),
});

export class Container extends ItemBase<ReturnType<typeof ContainerData>> {
    static override defineSchema() {
        return ContainerData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Container", "SR5.Item"];
}

export type ContainerType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ContainerData>>;
