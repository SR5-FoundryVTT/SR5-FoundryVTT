import { ImportHelper as IH } from '../../helper/ImportHelper';
import { ItemParserBase } from '../item/ItemParserBase';
import { Complexform } from '../../schema/ComplexformsSchema';
import { BonusHelper as BH } from '../../helper/BonusHelper';
import ComplexFormTarget = Shadowrun.ComplexFormTarget;
import ComplexFormItemData = Shadowrun.ComplexFormItemData;

export class ComplexFormParserBase extends ItemParserBase<ComplexFormItemData> {
    override Parse(jsonData: Complexform, item: ComplexFormItemData, jsonTranslation?: object): ComplexFormItemData {
        item.name = jsonData.name._TEXT;

        item.system.description.source = `${jsonData.source._TEXT} ${jsonData.page._TEXT}`;

        let fade = jsonData.fv._TEXT;
        if (fade.includes('+') || fade.includes('-')) {
            item.system.fade = parseInt(fade.substring(1, fade.length));
        }

        let duration = jsonData.duration._TEXT;
        if (duration === 'I') {
            item.system.duration = 'instant';
        } else if (duration === 'S') {
            item.system.duration = 'sustained';
        } else if (duration === 'P') {
            item.system.duration = 'permanent';
        }

        let target = jsonData.target._TEXT;
        switch (target) {
            case 'Device':
            case 'File':
            case 'Host':
            case 'Persona':
            case 'Self':
            case 'Sprite':
                item.system.target = target.toLowerCase() as ComplexFormTarget;
                break;
            default:
                item.system.target = 'other';
                break;
        }

        if (jsonData.bonus)
            BH.addBonus(item, jsonData.bonus);

        if (jsonTranslation) {
            const origName = jsonData.name._TEXT;
            item.name = IH.MapNameToTranslation(jsonTranslation, origName);
            item.system.description.source = `${jsonData.source._TEXT} ${IH.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return item;
    }
}
