import { SR5 } from "../../config";

export function iconAssign(itemType: string, name: string, system: Object): string {
    const itemTypes = SR5.itemTypes;
    console.log(itemType, name, system);
    let itemImg = "systems/shadowrun5e/dist/icons/importer/" + itemType + ".svg";

    return itemImg;
}