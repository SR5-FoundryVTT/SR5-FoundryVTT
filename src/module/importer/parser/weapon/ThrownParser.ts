import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import { Constants } from '../../importer/Constants';
import BlastData = Shadowrun.BlastData;
import WeaponItemData = Shadowrun.WeaponItemData;

export class ThrownParser extends WeaponParserBase {
    public GetBlast(jsonData: object, item: WeaponItemData): BlastData {
        let blastData: BlastData = {
            radius: 0,
            dropoff: 0,
        };

        let blastCode = ImportHelper.StringValue(jsonData, 'damage');

        let radiusMatch = blastCode.match(/([0-9]+m)/)?.[0];
        if (radiusMatch !== undefined) {
            radiusMatch = radiusMatch.match(/[0-9]+/)?.[0];
            if (radiusMatch !== undefined) {
                blastData.radius = parseInt(radiusMatch);
            }
        }

        let dropoffMatch = blastCode.match(/(-[0-9]+\/m)/)?.[0];
        if (dropoffMatch !== undefined) {
            dropoffMatch = dropoffMatch.match(/-[0-9]+/)?.[0];
            if (dropoffMatch !== undefined) {
                blastData.dropoff = parseInt(dropoffMatch);
            }
        }

        if (blastData.dropoff && !blastData.radius) {
            blastData.radius = -(item.system.action.damage.base / blastData.dropoff);
        }

        return blastData;
    }

    override Parse(jsonData: object, item: WeaponItemData, jsonTranslation?: object): WeaponItemData {
        item = super.Parse(jsonData, item, jsonTranslation);

        if (jsonData.hasOwnProperty('range')) {
            item.system.thrown.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, 'range')];
        } else {
            item.system.thrown.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, 'category')];
        }

        item.system.thrown.blast = this.GetBlast(jsonData, item);

        return item;
    }
}
