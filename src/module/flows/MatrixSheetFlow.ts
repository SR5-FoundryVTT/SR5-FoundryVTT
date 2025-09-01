import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { FormDialog, FormDialogOptions } from '@/module/apps/dialogs/FormDialog';
import { SelectMatrixNetworkDialog } from '@/module/apps/dialogs/SelectMatrixNetworkDialog';

/**
 * Handling of sheet presentation around matrix data.
 */
export const MatrixSheetFlow = {
    /**
     * Collect all matrix actions of an actor.
     * @param actor The actor to collect matrix actions from.
     */
    getMatrixActions(actor: SR5Actor): SR5Item[] {
        const actions = actor.itemsForType.get('action');
        // Normaly all item types should exist, though during actor creation this might not be the case.
        if (!actions) {
            return [];
        }
        return actions.filter((action: SR5Item) => action.hasActionCategory('matrix'));
    },

    /**
     * Handle the user request to reboot their main active matrix device or living persona.
     * @param actor
     */
    async promptRebootPersonaDevice(actor: SR5Actor) {
        const data = {
            title: game.i18n.localize("SR5.RebootConfirmationDialog.Title"),
            buttons: {
                confirm: {
                    label: game.i18n.localize('SR5.RebootConfirmationDialog.Confirm')
                },
                cancel: {
                    label: game.i18n.localize('SR5.RebootConfirmationDialog.Cancel')
                }
            },
            content: '',
            default: 'cancel',
            templateData: {},
            templatePath: 'systems/shadowrun5e/dist/templates/apps/dialogs/reboot-confirmation-dialog.hbs'
        }
        const options = {
            classes: ['sr5', 'form-dialog'],
        } as FormDialogOptions;
        const dialog = new FormDialog(data, options);
        await dialog.select();
        if (dialog.canceled || dialog.selectedButton !== 'confirm') return;

        await actor.rebootPersona();
    },

    /**
     * Handle changing if an Actor is Running Silent
     * @param actor
     */
    async toggleRunningSilent(actor: SR5Actor) {
        if (!actor.isMatrixActor) return;

        const matrixData = actor.matrixData();
        if (!matrixData) return;

        if (matrixData.device) {
            const device = matrixData.device;
            const item = actor.items.get(device);
            if (!item) return;

            // toggle between online and silent based on running silent status
            const newState = item.isRunningSilent() ? 'online' : 'silent';

            // update the embedded item with the new wireless state
            await actor.updateEmbeddedDocuments('Item', [{
                '_id': device,
                system: { technology: { wireless: newState } }
            }]);
        } else {
            await actor.update({
                system: {
                    matrix: {
                        running_silent: !matrixData.running_silent,
                    }
                }
            })
        }
    },

    /**
     * Allow the user to select a matrix network to connect to.
     * @param actor
     */
    async promptConnectToMatrixNetwork(actor: SR5Actor): Promise<boolean> {
        const dialog = new SelectMatrixNetworkDialog(actor);
        const network = await dialog.select();
        if (dialog.canceled) return false;

        await actor.connectNetwork(network);
        return true;
    }
}
