import {FormDialog, FormDialogData} from "./FormDialog";

export class DeleteConfirmationDialog extends FormDialog {
    constructor(options?) {
        const dialogData = DeleteConfirmationDialog.getDialogData() as unknown as FormDialogData;

        super(dialogData, options)
    }

    static getDialogData() {
        return {
            title: game.i18n.localize("SR5.DeleteConfirmationApplication.Title"),
            buttons: {
                delete: {
                    label: game.i18n.localize('SR5.DeleteConfirmationApplication.Delete')
                },
                cancel: {
                    label: game.i18n.localize('SR5.DeleteConfirmationApplication.Cancel')
                }
            },
            default: 'cancel',
            templateData: {},
            templatePath: 'systems/shadowrun5e/dist/templates/apps/dialogs/delete-confirmation-dialog.html'
        }
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'delete-confirmation-application';
        // Class Dialog here is needed for dialog button styling.
        options.classes = ['sr5', 'form-dialog'];
        options.resizable = true;
        options.height = 'auto';
        return options;
    }
}