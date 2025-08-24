import { DevicePartData } from "./Device";
import { BaseItemData, ItemBase } from "./ItemBase";
import { MatrixMasterData } from "../template/MatrixNetwork";
const { SchemaField, StringField, BooleanField } = foundry.data.fields;

const GridData = {
    ...BaseItemData(),
    ...DevicePartData(),

    matrix: new SchemaField(MatrixMasterData()),
    category: new StringField({ required: true, nullable: false, initial: 'local', choices: ['local', 'global'] })
};

export class Grid extends ItemBase<typeof GridData> {
    static override defineSchema() {
        return GridData;
    }
}

console.log("GridData", GridData, new Grid());
