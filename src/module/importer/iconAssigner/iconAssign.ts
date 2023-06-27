import { SR5 } from "../../config";

export function iconAssign(itemType: string, name: string): string {
    const itemTypes = SR5.itemTypes;
    let itemImg = "systems/shadowrun5e/dist/icons/importer/" + itemType + ".svg";

    return itemImg;
}