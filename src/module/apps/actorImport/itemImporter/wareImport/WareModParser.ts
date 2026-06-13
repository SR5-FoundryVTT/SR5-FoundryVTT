import { BlankItem, ExtractItemType, Parser } from "../Parser";

type WareType = 'bioware' | 'cyberware';

export class WareModParser extends Parser<'modification'> {
    protected readonly parseType = 'modification';
    protected wareType: WareType;

    constructor(wareType: WareType) {
        super();
        this.wareType = wareType;
    }

    protected parseItem(item: BlankItem<'modification'>, itemData: ExtractItemType<'cyberwares', 'cyberware'>) {
        const system = item.system;

        system.type = 'ware';
        system.technology.equipped = true;
        system.essence = parseFloat(itemData.ess) || 0;
        system.slots = parseInt(itemData.capacity.replace(/[[\]]/g, '')) || 0;

        if (this.wareType === 'bioware') {
            system.technology.wireless = 'none';
        }
    }
}
