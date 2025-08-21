import { SR5Actor } from '@/module/actor/SR5Actor';
import { AttributeRules } from '@/module/rules/AttributeRules';
import { SkillRules } from '@/module/rules/SkillRules';

export class RiggingRules {
    /**
     * Modify the roll data by using the Driver's data
     * @param driverData
     * @param rollData
     */
    static modifyRollDataForDriver(driverData: SR5Actor['system'], rollData: SR5Actor['system']) {

        const driverSkills = driverData.skills.active;
        if (!driverSkills) return;

        const driverAttributes = driverData.attributes;
        if (!driverAttributes) return;

        const injectAttributes = ['intuition', 'reaction', 'logic', 'agility'];
        AttributeRules._injectAttributes(injectAttributes, driverAttributes, rollData, { bigger: false });

        const injectSkills = ['perception', 'sneaking', 'gunnery', 'pilot_aerospace', 'pilot_aircraft',
            'pilot_exotic_vehicle', 'pilot_ground_craft', 'pilot_walker', 'pilot_water_craft'
        ];
        SkillRules._injectActiveSkills(injectSkills, driverSkills, rollData, { bigger: false });
    }
}
