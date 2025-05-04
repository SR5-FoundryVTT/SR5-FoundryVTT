import { ImportHelper } from '../../helper/ImportHelper';
import { ItemParserBase } from '../item/ItemParserBase';
import QualityItemData = Shadowrun.QualityItemData;
import { Quality } from '../../schema/QualitiesSchema';
import { BonusHelper as BH } from '../../helper/BonusHelper';

export class QualityParserBase extends ItemParserBase<QualityItemData> {
    public override async Parse(jsonData: Quality, item: QualityItemData, jsonTranslation?): Promise<QualityItemData> {
        item.name = jsonData.name._TEXT;

        item.system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        item.system.type = jsonData.category._TEXT === 'Positive' ? 'positive' : 'negative';
        item.system.karma = +(jsonData.karma._TEXT ?? 0);

        if (jsonData.bonus)
            await BH.addBonus(item, jsonData.bonus);

        if (jsonTranslation) {
            const origName = item.name;
            item.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            item.system.description.source = `${jsonData.source._TEXT} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return item;
    }
}
