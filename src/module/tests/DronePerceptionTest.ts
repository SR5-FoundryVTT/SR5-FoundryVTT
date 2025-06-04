import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import {SuccessTest} from "./SuccessTest";

export class DronePerceptionTest extends SuccessTest {
    static override async _getDocumentTestAction(item: SR5Item, actor: SR5Actor) {
        // Both item and actor are needed to determine what to roll.
        if (!item || !actor) return {};

        const vehicleData = actor.asType('vehicle');
        if (!vehicleData) {
            await ui.notifications?.error(game.i18n.localize('SR5.Errors.TestExpectsVehicleOnly'))
            return {};
        }

        switch (vehicleData.system.controlMode) {
            case "autopilot": {
                const attribute = 'pilot';
                const skill = 'perception';
                const limit = {attribute: 'sensor'};

                return {attribute, skill, limit};
            }

            default:
                return actor.skillActionData('perception');
        }
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['rigging'];
    }
}