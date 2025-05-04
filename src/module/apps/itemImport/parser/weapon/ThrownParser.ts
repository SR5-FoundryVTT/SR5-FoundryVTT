import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import BlastData = Shadowrun.BlastData;
import WeaponItemData = Shadowrun.WeaponItemData;
import { DataDefaults } from '../../../../data/DataDefaults';
import { Weapon } from '../../schema/WeaponsSchema';

export class ThrownParser extends WeaponParserBase {
    public GetBlast(jsonData: Weapon, item: WeaponItemData): BlastData {
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

    override async Parse(jsonData: Weapon, item: WeaponItemData, jsonTranslation?: object): Promise<WeaponItemData> {
        item = await super.Parse(jsonData, item, jsonTranslation);

        const rangeCategory = ImportHelper.StringValue(jsonData, jsonData.hasOwnProperty('range') ? 'range' : 'category');
        item.system.thrown.ranges = DataDefaults.weaponRangeData(this.GetRangeDataFromImportedCategory(rangeCategory));

        item.system.thrown.blast = this.GetBlast(jsonData, item);

        return item;
    }
}
