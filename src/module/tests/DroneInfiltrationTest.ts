import {SuccessTest} from "./SuccessTest";

export class DroneInfiltrationTest extends SuccessTest {
    static override async _getDocumentTestAction(item, actor) {
        // Both item and actor are needed to determine what to roll.
        if (!item || !actor) return {};

        const vehicleData = actor.asVehicle();
        if (!vehicleData) {
            await ui.notifications?.error(game.i18n.localize('SR5.Errors.TestExpectsVehicleOnly'))
            return {};
        }

        switch (vehicleData.system.controlMode) {
            // See SR5#270 'Drone Infiltration'
            case "autopilot": {
                const attribute = 'pilot';
                const skill = 'sneaking';
                const limit = 'sensor';

                return {attribute, skill, limit};
            }
            case "rigger": {
                const attribute = 'intuition';
                const skill = 'sneaking';
                const limit = 'handling';

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