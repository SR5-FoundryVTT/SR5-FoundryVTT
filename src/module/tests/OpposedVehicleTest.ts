import { DeepPartial } from "fvtt-types/utils";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { ActionRollType, MinimalActionType } from "../types/item/Action";
import { OpposedTest } from "./OpposedTest";
import { SuccessTestData } from "./SuccessTest";

/**
 * Opposed test for vehicle stunts, chase actions, and ramming defenses.
 * - When a vehicle opposes, it rolls its vehicle pilot skill + Pilot (autopilot) or Reaction (driver) with Handling/Speed limit.
 * - When a character (e.g. pedestrian opposing Ramming) opposes, it rolls Reaction + Intuition (SR5 Core p. 203).
 */
export class OpposedVehicleTest extends OpposedTest {
    static override _getDefaultTestAction(): DeepPartial<MinimalActionType> {
        return {
            attribute: 'reaction',
            attribute2: 'intuition'
        };
    }

    static override _getDocumentTestAction(item: SR5Item, actor: SR5Actor): DeepPartial<MinimalActionType> {
        if (!actor) return {};

        const vehicleData = actor.asType('vehicle');
        if (vehicleData) {
            const itemLimit = item?.getAction()?.limit?.attribute;
            const limitAttribute = itemLimit === 'speed' ? 'speed' : (vehicleData.system.environment || 'handling');
            const skill = actor.getVehicleTypeSkillName() || 'pilot_ground_craft';
            const attribute = vehicleData.system.controlMode === 'autopilot' ? 'pilot' : 'reaction';

            return {
                attribute,
                attribute2: '',
                skill,
                limit: { attribute: limitAttribute }
            };
        }

        const opposedSkill = item?.getAction()?.opposed?.skill;
        const opposedAttr = item?.getAction()?.opposed?.attribute;
        if (opposedSkill && opposedAttr) {
            return {
                attribute: opposedAttr,
                attribute2: '',
                skill: opposedSkill
            };
        }

        return {
            attribute: 'reaction',
            attribute2: 'intuition',
            skill: ''
        };
    }

    static override _prepareActionTestData(
        action: ActionRollType,
        document: SR5Actor | SR5Item,
        data: SuccessTestData,
        againstData?: SuccessTestData
    ) {
        if (document instanceof SR5Actor) {
            const vehicleData = document.asType('vehicle');
            if (vehicleData) {
                const againstLimit = againstData?.action?.limit?.attribute || action.limit?.attribute;
                const limitAttribute = againstLimit === 'speed' ? 'speed' : (vehicleData.system.environment || 'handling');
                const skill = document.getVehicleTypeSkillName() || 'pilot_ground_craft';
                const attribute = vehicleData.system.controlMode === 'autopilot' ? 'pilot' : 'reaction';

                action.attribute = attribute;
                action.attribute2 = '';
                action.skill = skill;
                action.limit.attribute = limitAttribute;
            } else {
                const opposedSkill = againstData?.opposed?.skill;
                const opposedAttr = againstData?.opposed?.attribute;
                if (opposedSkill && opposedAttr) {
                    action.attribute = opposedAttr;
                    action.attribute2 = '';
                    action.skill = opposedSkill;
                } else {
                    action.attribute = 'reaction';
                    action.attribute2 = 'intuition';
                    action.skill = '';
                }
            }
        }

        return super._prepareActionTestData(action, document, data, againstData);
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['rigging'];
    }
}
