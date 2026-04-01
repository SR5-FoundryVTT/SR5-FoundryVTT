import { PromptDialogData, PromptDialog } from './FormDialog';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';

export class DeleteConfirmationDialog extends PromptDialog {
    constructor(options?) {
        const dialogData = DeleteConfirmationDialog.getDialogData();

        super(dialogData, options)
    }

    static getDialogData(): PromptDialogData {
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
            templatePath: 'systems/shadowrun5e/dist/templates/apps/dialogs/delete-confirmation-dialog.hbs'
        }
    }

    static override DEFAULT_OPTIONS = {
        ...PromptDialog.DEFAULT_OPTIONS,
        id: 'delete-confirmation-application',
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'form-dialog'],
        window: {
            resizable: true,
        },
        position: {
            width: 420,
            height: 'auto' as const,
        },
    }
}