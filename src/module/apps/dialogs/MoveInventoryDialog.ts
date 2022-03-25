import {FormDialog, FormDialogData} from "./FormDialog";
import {SR5Actor} from "../../actor/SR5Actor";

/**
 * Show a list of the SR5Actor inventories to the user and let them choose one.
 *
 * @returns The inventory name selected.
 */
export class MoveInventoryDialog extends FormDialog {
    /**
     * @param actor Use this actor's inventories to select from.
     * @param sourceInventory The currently selected inventory, which won't be displayed.
     * @param options
     */
    constructor(actor: SR5Actor, sourceInventory: string, options?) {
        const dialogData = MoveInventoryDialog.getDialogData(actor, sourceInventory) as unknown as FormDialogData;

        super(dialogData, options);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'move-inventory-application';
        options.classes = ['sr5', 'form-dialog'];
        options.height = 'auto';
        return options;
    }

    static getDialogData(actor: SR5Actor, sourceInventory: string) {
        // Get all inventories, excluding the currently shown one.
        const inventories = Object.values(actor.data.data.inventories)
                                  .filter(inventory => inventory.name !== sourceInventory);
        // Add the default inventories for selection when necessary.
        if (sourceInventory !== actor.defaultInventory.name) inventories.unshift(actor.defaultInventory);

        return {
            title: game.i18n.localize('SR5.MoveInventoryDialog.Title'),
            buttons: {
                move: {
                    label: game.i18n.localize('SR5.MoveInventoryDialog.Move')
                },
                cancel: {
                    label: game.i18n.localize('SR5.MoveInventoryDialog.Cancel')
                }
            },
            default: 'cancel',
            templateData: {inventories},
            templatePath: 'systems/shadowrun5e/dist/templates/apps/dialogs/move-inventory-dialog.html',
            onAfterClose: async html => {
                return html.find('input[name="inventories"]:checked').val();
            }
        }
    }
}