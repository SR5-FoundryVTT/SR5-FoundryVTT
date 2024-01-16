import {SuccessTest} from "./SuccessTest";

export class DronePerceptionTest extends SuccessTest {
    static override async _getDocumentTestAction(item, actor) {
        // Both item and actor are needed to determine what to roll.
        if (!item || !actor) return {};

        const vehicleData = actor.asVehicle();
        if (!vehicleData) {
            await ui.notifications?.error(game.i18n.localize('SR5.Errors.TestExpectsVehicleOnly'))
            return {};
        }

        switch (vehicleData.data.controlMode) {
            case "autopilot": {
                const attribute = 'pilot';
                const skill = 'perception';
                const limit = 'sensor';

                return {attribute, skill, limit};
            }

            default:
                return actor.skillActionData('perception');
        }
    }
}