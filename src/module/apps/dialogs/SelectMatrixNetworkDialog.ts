import { Helpers } from "../../helpers";
import { MatrixNetworkFlow } from "../../item/flows/MatrixNetworkFlow";
import { SR5Item } from "../../item/SR5Item";
import { FormDialog, FormDialogData } from "./FormDialog";
import { SR5Actor } from '../../actor/SR5Actor';

/**
 * Present users with a list of matrix networks to select a single one from.
 */
export class SelectMatrixNetworkDialog extends FormDialog {
    constructor(character: SR5Actor, options?) {
        const dialogData = SelectMatrixNetworkDialog.getDialogData(character) as unknown as FormDialogData;
        super(dialogData, options);

    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'select-matrix-network-application';
        options.classes = ['sr5', 'form-dialog'];
        options.height = 'auto';
        return options;
    }

    static getDialogData(character: SR5Actor) {
        const networks = SelectMatrixNetworkDialog.selectableNetworks(character);

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
    static selectableNetworks(character: SR5Actor) {
        let networks: SR5Item[] = [];
        if (game.user?.isGM) {
            networks = MatrixNetworkFlow.getNetworks();
        } else {
            networks = MatrixNetworkFlow.getNetworksForCharacter(character);
        }
        return networks.sort(Helpers.sortByName.bind(this));
    }
}