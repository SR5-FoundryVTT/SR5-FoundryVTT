import { ImportHelper } from '../../helper/ImportHelper';
import { ItemParserBase } from '../item/ItemParserBase';
import ComplexFormTarget = Shadowrun.ComplexFormTarget;
import ComplexFormItemData = Shadowrun.ComplexFormItemData;

export class ComplexFormParserBase extends ItemParserBase<ComplexFormItemData> {
    Parse(jsonData: object, item: ComplexFormItemData, jsonTranslation?: object): ComplexFormItemData {
        // @ts-ignore // TODO: Foundry Where is my foundry base data?
        item.name = ImportHelper.StringValue(jsonData, 'name');

        item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        let fade = ImportHelper.StringValue(jsonData, 'fv');
        if (fade.includes('+') || fade.includes('-')) {
            item.system.fade = parseInt(fade.substring(1, fade.length));
        }

        let duration = ImportHelper.StringValue(jsonData, 'duration');
        if (duration === 'I') {
            item.system.duration = 'instant';
        } else if (duration === 'S') {
            item.system.duration = 'sustained';
        } else if (duration === 'P') {
            item.system.duration = 'permanent';
        }

        let target = ImportHelper.StringValue(jsonData, 'target');
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

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            // @ts-ignore // TODO: Foundry Where is my foundry base data?
            item.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            item.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return item;
    }
}
