import { ImportHelper as IH } from '../../helper/ImportHelper';
import CritterPowerCategory = Shadowrun.CritterPowerCategory;
import { ItemParserBase } from '../item/ItemParserBase';
import CritterPowerItemData = Shadowrun.CritterPowerItemData;
import { Power } from '../../schema/CritterpowersSchema';
import { BonusHelper as BH } from '../../helper/BonusHelper';

export class CritterPowerParserBase extends ItemParserBase<CritterPowerItemData> {
    public override async Parse(jsonData: Power, item: CritterPowerItemData, jsonTranslation?: object): Promise<CritterPowerItemData> {
        item.name = jsonData.name._TEXT;

        item.system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        const category = jsonData.category._TEXT.toLowerCase();
        item.system.category = (category.includes("infected") ? "infected" : category) as CritterPowerCategory;

        let duration = jsonData.duration ? jsonData.duration._TEXT : "";
        if (duration === 'Always') {
            item.system.duration = 'always';
        } else if (duration === 'Instant') {
            item.system.duration = 'instant';
        } else if (duration === 'Sustained') {
            item.system.duration = 'sustained';
        } else if (duration === 'Permanent') {
            item.system.duration = 'permanent';
        } else {
            item.system.duration = 'special';
        }

        let range = jsonData.range ? jsonData.range._TEXT : "";
        if (range === 'T') {
            item.system.range = 'touch';
        } else if (range === 'LOS') {
            item.system.range = 'los';
        } else if (range === 'LOS (A)') {
            item.system.range = 'los_a';
        } else if (range === 'Self') {
           item.system.range = 'self';
        } else {
            item.system.range = 'special';
        }

        let type = jsonData.type ? jsonData.type._TEXT : "";
        if (type === 'P') {
            item.system.powerType = 'physical';
        } else if (type === 'M') {
            item.system.powerType = 'mana';
        }

        if (jsonTranslation) {
            const origName = item.name;
            item.name = IH.MapNameToTranslation(jsonTranslation, origName);
            item.system.description.source = `${jsonData.source._TEXT} ${IH.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        if (jsonData.bonus)
            await BH.addBonus(item, jsonData.bonus);

        return item;
    }
}
