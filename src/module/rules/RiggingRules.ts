import { SR5Actor } from '@/module/actor/SR5Actor';
import { AttributeRules } from '@/module/rules/AttributeRules';
import { SkillRules } from '@/module/rules/SkillRules';
import { SuccessTestData } from '@/module/tests/SuccessTest';

export const RiggingRules = {
    /**
     * Modify the roll data by using the Driver's data
     * @param driverData
     * @param rollData
     */
    modifyRollDataForDriver(driverData: SR5Actor['system'], rollData: SR5Actor['system']) {

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
    },

    /**
     * Determine if the provided testData should be considered a matrix action when a Rigger is jumped in
     * Defined in SR5 pg #266 "VR AND RIGGING"
     * @param testData
     */
    isConsideredMatrixAction(testData: SuccessTestData): boolean {
        if (testData.categories.includes('rigging')) return true;
        if (['sensor', 'handling', 'speed'].includes(testData.action.limit.attribute)) return true;
        return false;
    },
}
