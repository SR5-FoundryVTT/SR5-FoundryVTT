import {SuccessTest} from "./SuccessTest";

export class DronePerceptionTest extends SuccessTest {
    static override async _getDocumentTestAction(item, actor) {
        // Both item and actor are needed to determine what to roll.
        if (!item || !actor) return {};

        const vehicleData = actor.asVehicle();
        if (!vehicleData) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.TestExpectsVehicleOnly'));
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