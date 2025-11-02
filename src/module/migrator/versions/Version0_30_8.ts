import { VersionMigration } from "../VersionMigration";

/**
 * Update lifestyle and complex forms to correct data fields
 * -- this may need to moved to a higher version prior to actual release
 */
export class Version0_30_8 extends VersionMigration {
    readonly TargetVersion = "0.30.8";

    override handlesItem(_item: Readonly<any>) { return _item.type === 'lifestyle' || _item.type === 'complex_form'; }

    override migrateItem(_item: any) {
        super.migrateItem(_item);
        if (_item.type === 'lifestyle') {
            if (_item.system.type === 'middle') {
                _item.system.type = 'medium';
            }
        }
        if (_item.type === 'complex_form') {
            if (_item.system.duration === 'instant') {
                _item.system.duration = 'immediate';
            }
        }
    }
}
