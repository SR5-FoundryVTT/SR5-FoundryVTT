import { SR5Actor } from '@/module/actor/SR5Actor';
import { AttributeRules } from '@/module/rules/AttributeRules';
import { SkillRules } from '@/module/rules/SkillRules';
import { SuccessTestData } from '@/module/tests/SuccessTest';

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
        AttributeRules.injectAttributes(injectAttributes, driverAttributes, rollData, { bigger: false });

        const injectSkills = ['perception', 'sneaking', 'gunnery', ...this.PilotSkills];
        SkillRules.injectActiveSkills(injectSkills, driverSkills, rollData, { bigger: false });
    };

    static PilotSkills = [
        'pilot_aerospace',
        'pilot_aircraft',
        'pilot_exotic_vehicle',
        'pilot_ground_craft',
        'pilot_walker',
        'pilot_water_craft'
    ];

    /**
     * Determine if the provided testData should be considered a matrix action when a Rigger is jumped in
     * Defined in SR5 pg #266 "VR AND RIGGING"
     * @param testData
     */
    static isConsideredMatrixAction(testData: SuccessTestData): boolean {
        if (testData.categories.includes('rigging')) return true;
        if (['sensor', 'handling', 'speed'].includes(testData.action.limit.attribute)) return true;
        if (['gunnery', ...this.PilotSkills].includes(testData.action.skill)) return true;
        return false;
    };
}
