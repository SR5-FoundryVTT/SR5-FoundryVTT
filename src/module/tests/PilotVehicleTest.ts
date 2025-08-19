import { DeepPartial } from "fvtt-types/utils";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { MinimalActionType } from "../types/item/Action";
import {SuccessTest} from "./SuccessTest";

export class PilotVehicleTest extends SuccessTest {
    /**
     * Piloting a vehicle will alter the kind of test that needs to be made based on a few factors.
     *
     * @param item The testing item to cast
     * @param actor The vehicle actor to be casting with
     */
    static override _getDocumentTestAction(item: SR5Item, actor: SR5Actor): DeepPartial<MinimalActionType> {
        // Both item and actor are needed to determine what to roll.
        if (!item || !actor) return {};

        const vehicleData = actor.asType('vehicle');
        if (!vehicleData) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.TestExpectsVehicleOnly'))
            return {};
        }

        switch (vehicleData.system.controlMode) {
            case "autopilot": {
                const attribute = 'pilot';
                const skill = actor.getVehicleTypeSkillName();
                const limit = {attribute: vehicleData.system.environment};

                return {attribute, skill, limit};
            }
            case "rigger": {
                const attribute = 'reaction';
                const skill = actor.getVehicleTypeSkillName();
                const limit = {attribute: vehicleData.system.environment};

                return {attribute, skill, limit};
            }

            default:
                const skillId = actor.getVehicleTypeSkillName()!;
                return actor.skillActionData(skillId)!;
        }
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['rigging']
    }
}