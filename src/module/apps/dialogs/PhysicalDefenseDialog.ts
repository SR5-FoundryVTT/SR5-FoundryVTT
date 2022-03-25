import {TestDialog} from "./TestDialog";


export class PhysicalDefenseDialog extends TestDialog {
    static get templateContent(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-defense-dialog.html';
    }
}