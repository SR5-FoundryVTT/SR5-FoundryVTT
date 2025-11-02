import { BlankItem, ExtractItemType, Parser } from "../Parser";

export class WareParser extends Parser<'bioware' | 'cyberware'> {
    protected readonly parseType: 'bioware' | 'cyberware';

    constructor(parseType: 'bioware' | 'cyberware') {
        super();
        this.parseType = parseType;
    }

    protected parseItem(item: BlankItem<'bioware' | 'cyberware'>, itemData: ExtractItemType<'cyberwares', 'cyberware'>) {
        const system = item.system;

        // Cyberware and Bioware have no equipped flag in chummer so it cannot be parsed - we consider it as always equipped
        system.technology.equipped = true;
        system.essence = Number(itemData.ess) || 0;
        system.grade = itemData.grade.toLowerCase() as 'standard' | 'alpha' | 'beta' | 'delta' | 'gamma';

        // Bioware has no wireless feature, so disable it by default
        if (this.parseType === 'bioware') {
            system.technology.wireless = 'none';
        }
    }
}
