import { VersionMigration } from "../VersionMigration";
import { SR5 } from '@/module/config';

type TempField = {
    label: string;
    path: string;
    value: number;
}

/**
 * Migration for version 0.31.0:
 * - Updates data schema to correct value choices.
 * - Fixes typo in lifestyle type ('luxory' → 'luxury').
 * - Updates lifestyle and complex form items to correct data fields.
 * - Converts all 'temp' fields in actor attributes, matrix attributes, vehicle stats, and active skills
 *   into active effects, removing the 'temp' property and preserving its value as an effect.
 */
export class Version0_31_0 extends VersionMigration {
    readonly TargetVersion = "0.31.0";

    override migrateItem(_item: any): void {
        if (_item.type === 'lifestyle') {
            if (_item.system.type === 'luxory') _item.system.type = 'luxury';
            if (_item.system.type === 'middle') _item.system.type = 'medium';
        }
        if (_item.type === 'complex_form' && _item.system.duration === 'instant') {
            _item.system.duration = 'immediate';
        }
    }

    override migrateActor(_actor: any) {
        // make of a map of all the attributes with a temp field
        const tempFields: TempField[] = [];

        for (const [key, v] of Object.entries(_actor.system.attributes)) {
            const attribute = v as any;
            if (attribute?.['temp']) {
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
                if (attribute?.['temp']) {
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
                if (attribute?.['temp']) {
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
            if (skill?.['temp']) {
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
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        priority: 0,
                        value: String(tempField.value),
                    }],
                    description: "Effect converted from removed Temp fields",
                    system: {
                        applyTo: 'actor' as const,
                    }
                }
            });
            _actor.effects.push(...effectData);
        }
    }
}
