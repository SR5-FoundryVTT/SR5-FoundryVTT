import { WeaponParserBase } from './WeaponParserBase';
import BlastData = Shadowrun.BlastData;
import WeaponItemData = Shadowrun.WeaponItemData;
import { DataDefaults } from '../../../../data/DataDefaults';
import { Weapon } from '../../schema/WeaponsSchema';

export class ThrownParser extends WeaponParserBase {
    public GetBlast(system: WeaponItemData['system'], jsonData: Weapon): BlastData {
        const blastData: BlastData = {
            radius: 0,
            dropoff: 0,
        };

        const blastCode = jsonData.damage._TEXT;

        let radiusMatch = blastCode.match(/([0-9]+m)/)?.[0];
        if (radiusMatch) {
            radiusMatch = radiusMatch.match(/[0-9]+/)?.[0];
            if (radiusMatch)
                blastData.radius = parseInt(radiusMatch);
        }

        let dropoffMatch = blastCode.match(/(-[0-9]+\/m)/)?.[0];
        if (dropoffMatch) {
            dropoffMatch = dropoffMatch.match(/-[0-9]+/)?.[0];
            if (dropoffMatch)
                blastData.dropoff = parseInt(dropoffMatch);
        }

        if (blastData.dropoff && !blastData.radius)
            blastData.radius = -(system.action.damage.base / blastData.dropoff);

        return blastData;
    }

    protected override getSystem(jsonData: Weapon): WeaponItemData['system'] {
        const system = super.getSystem(jsonData);

        const rangeCategory = jsonData.range?._TEXT || jsonData.category._TEXT;
        system.thrown.ranges = DataDefaults.weaponRangeData(this.GetRangeDataFromImportedCategory(rangeCategory));

        system.thrown.blast = this.GetBlast(system, jsonData);

        return system;
    }
}
