import {FormDialog} from "./FormDialog";
import {Helpers} from "../../helpers";


export class InventoryCreateItemDialog extends FormDialog {
    constructor(options?: Application.Options) {
        const dialogData = InventoryCreateItemDialog.getDialogData();

        super(dialogData, options);
    }

    static getDialogData() {
        // TODO: Only show actor inventory item types.
        const itemTypes = CONFIG.Item.typeLabels;

        return {
            title: 'Create',
            buttons: {
                create: {
                    label: 'Create'
                }
            },
            default: 'create',
            templateData: {
                itemTypes
            },
            onAfterClose: async (html, button) => {
                // Select the use chosen item type.
                const selectItemType = html.find('[name="itemType"]');
                const itemType = selectItemType.find(':selected').val();
                return {itemType};
            },
            templatePath: 'systems/shadowrun5e/dist/templates/apps/dialogs/inventory-create-item-dialog.html'
        }
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'inventory-create-item-application';
        // Class Dialog here is needed for dialog button styling.
        options.classes = ['sr5', 'form-dialog'];
        options.resizable = true;
        options.height = 'auto';
        return options;
    }
}