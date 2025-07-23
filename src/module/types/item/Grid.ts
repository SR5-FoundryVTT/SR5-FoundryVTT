import { DevicePartData } from "./Device";
import { BaseItemData, ItemBase } from "./ItemBase";
import { MatrixMasterData } from "../template/MatrixNetwork";
const { SchemaField } = foundry.data.fields;

const GridData = {
    ...BaseItemData(),
    ...DevicePartData(),

    matrix: new SchemaField(MatrixMasterData()),
};

export class Grid extends ItemBase<typeof GridData> {
    static override defineSchema() {
        return GridData;
    }
}

console.log("GridData", GridData, new Grid());
