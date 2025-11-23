import { SR5 } from "@/module/config";
import { DevicePartData } from "./Device";
import { BaseItemData, ItemBase } from "./ItemBase";
import { MatrixMasterData } from "../template/MatrixNetwork";
const { SchemaField, StringField } = foundry.data.fields;

const GridData = {
    ...BaseItemData(),
    ...DevicePartData(),

    matrix: new SchemaField(MatrixMasterData()),
    category: new StringField({
        required: true,
        initial: 'local',
        choices: SR5.gridCategories,
    })
};

export class Grid extends ItemBase<typeof GridData> {
    static override defineSchema() {
        return GridData;
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Grid", "SR5.Item"];
}

console.log("GridData", GridData, new Grid());
