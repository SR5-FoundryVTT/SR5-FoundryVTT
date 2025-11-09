import { VersionMigration } from "../VersionMigration";
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5 } from '@/module/config';

type TempField = {
    label: string;
    path: string;
    value: number;
}

/**
 * Update lifestyle and complex forms to correct data fields
 * -- this may need to moved to a higher version prior to actual release
 */
export class Version0_30_8 extends VersionMigration {
    readonly TargetVersion = "0.30.8";

    override handlesActor(_actor: Readonly<any>): boolean {
        return true;
    }

    override migrateActor(_actor: any) {
        super.migrateActor(_actor);
        // make of a map of all the attributes with a temp field
        const tempFields: TempField[] = [];
        for (const [key, v] of Object.entries(_actor.system.attributes)) {
            const attribute = v as any;
            if (attribute['temp']) {
                tempFields.push({
                    label: `${game.i18n.localize(attribute.label || SR5.attributes[key]) || 'Attribute'} Adjustment`,
                    path: `system.attributes.${key}`,
                    value: attribute.temp,
                })
                attribute.temp = 0;
            }
        }
        if (_actor.system.matrix) {
            for (const key of ['attack', 'sleaze', 'data_processing', 'firewall']) {
                const attribute = _actor.system.matrix[key];
                if (attribute['temp']) {
                    tempFields.push({
                        label: `${game.i18n.localize(attribute.label || SR5.attributes[key]) || 'Matrix Attribute'} Adjustment`,
                        path: `system.matrix.${key}`,
                        value: attribute.temp,
                    })
                    attribute.temp = 0;
                }
            }
        }
        if (_actor.type === 'vehicle') {
            for (const [key, v] of Object.entries(_actor.system.vehicle_stats)) {
                const attribute = v as any;
                if (attribute['temp']) {
                    tempFields.push({
                        label: `${game.i18n.localize(attribute.label || SR5.vehicle.stats[key]) || 'Vehicle Attribute'} Adjustment`,
                        path: `system.vehicle_stats.${key}`,
                        value: attribute.temp,
                    })
                    attribute.temp = 0;
                }
            }
        }
        for (const [key, v] of Object.entries(_actor.system.skills.active)) {
            const skill = v as any;
            if (skill['temp']) {
                tempFields.push({
                    label: `${game.i18n.localize(skill.label || SR5.activeSkills[key]) || 'Skill'} Adjustment`,
                    path: `system.skills.active.${key}`,
                    value: skill.temp,
                })
                skill.temp = 0;
            }
        }
        if (tempFields.length) {
            console.debug('****************************************', _actor);
            console.log('Found Temp Fields:', tempFields);
            const effectData = tempFields.map(tempField => {
                return {
                    _id: foundry.utils.randomID(16),
                    name: tempField.label,
                    changes: [{
                            key: tempField.path,
                            mode: 0 as any,
                            priority: 0,
                            value: String(tempField.value),
                        }],
                    description: "Effect converted from removed Temp fields",
                    system: {
                        applyTo: 'actor' as const,
                    }
                }
            })
            _actor.effects.push(...effectData);
        }
    }

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
