import { SystemType } from '../Parser';
import { Weapon } from '../../schema/WeaponsSchema';
import { WeaponParserBase } from './WeaponParserBase';
import { BlastType } from 'src/module/types/item/Weapon';
import { DataDefaults } from '../../../../data/DataDefaults';

export class ThrownParser extends WeaponParserBase {
    public GetBlast(system: SystemType<'weapon'>, jsonData: Weapon): BlastType {
        const blastData: BlastType = { radius: 0, dropoff: 0 };

        const blastCode = jsonData.damage._TEXT;

        let radiusMatch = /([0-9]+m)/.exec(blastCode)?.[0];
        if (radiusMatch) {
            radiusMatch = /[0-9]+/.exec(radiusMatch)?.[0];
            if (radiusMatch)
                blastData.radius = parseInt(radiusMatch);
        }

        let dropoffMatch = /(-[0-9]+\/m)/.exec(blastCode)?.[0];
        if (dropoffMatch) {
            dropoffMatch = /-[0-9]+/.exec(dropoffMatch)?.[0];
            if (dropoffMatch)
                blastData.dropoff = parseInt(dropoffMatch);
        }

        if (blastData.dropoff && !blastData.radius)
            blastData.radius = -(system.action.damage.base / blastData.dropoff);

        return blastData;
    }

    protected override getSystem(jsonData: Weapon) {
        const system = super.getSystem(jsonData);

        const rangeCategory = jsonData.range?._TEXT || jsonData.category._TEXT;
        system.thrown.ranges = DataDefaults.createData('range', this.GetRangeDataFromImportedCategory(rangeCategory));

        system.thrown.blast = this.GetBlast(system, jsonData);

        return system;
    }
}
