import { Helpers } from "../../helpers";
import { MatrixNetworkFlow } from "../../item/flows/MatrixNetworkFlow";
import { FormDialog, FormDialogData } from "./FormDialog";

/**
 * Present users with a list of matrix networks to select a single one from.
 */
export class SelectMatrixNetworkDialog extends FormDialog {
    constructor(options?) {
        const dialogData = SelectMatrixNetworkDialog.getDialogData() as unknown as FormDialogData;

        super(dialogData, options);
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'select-matrix-network-application';
        options.classes = ['sr5', 'form-dialog'];
        options.height = 'auto';
        return options;
    }

    static getDialogData() {
        const networks = SelectMatrixNetworkDialog.selectableNetworks();

        return {
            title: game.i18n.localize('SR5.SelectMatrixNetworkDialog.Title'),
            buttons: {
                move: {
                    label: game.i18n.localize('SR5.MoveInventoryDialog.Move')
                },
                cancel: {
                    label: game.i18n.localize('SR5.MoveInventoryDialog.Cancel')
                }
            },
            default: 'cancel',
            templateData: { networks },
            templatePath: 'systems/shadowrun5e/dist/templates/apps/dialogs/select-network-dialog.html',
            onAfterClose: async html => {
                const uuid = html.find('input[name="networks"]:checked').val();
                return fromUuidSync(uuid);
            }
        }
    }

    /**
     * Load a sorted list of matrix networks.
     */
    static selectableNetworks() {
        const networks = MatrixNetworkFlow.getNetworks();
        return networks.sort(Helpers.sortByName.bind(this));
    }
}