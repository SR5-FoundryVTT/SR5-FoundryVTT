import {SuccessTest} from "./SuccessTest";
import localize from '../utils/strings';

export class DroneInfiltrationTest extends SuccessTest {
    static override async _getDocumentTestAction(item, actor) {
        // Both item and actor are needed to determine what to roll.
        if (!item || !actor) return {};

        const vehicleData = actor.asVehicle();
        if (!vehicleData) {
            await ui.notifications?.error(localize('SR5.Errors.TestExpectsVehicleOnly'))
            return {};
        }

        switch (vehicleData.data.controlMode) {
            case "autopilot": {
                const attribute = 'pilot';
                const skill = 'sneaking';
                const limit = 'sensor';

                return {attribute, skill, limit};
            }

            default:
                return actor.skillActionData('perception');
        }
    }
}