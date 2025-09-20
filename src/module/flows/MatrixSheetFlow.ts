import { SR5Actor } from '../actor/SR5Actor';
import { FormDialog, FormDialogOptions } from '@/module/apps/dialogs/FormDialog';
import { SelectMatrixNetworkDialog } from '@/module/apps/dialogs/SelectMatrixNetworkDialog';

/**
 * Handling of sheet presentation around matrix data.
 */
export const MatrixSheetFlow = {
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

        // here we specifically get the device and don't check if it is a Living Persona
        // If we have an equipped Living Persona, we want that to control our "Running Silent" status for best synchronicity
        const device = actor.getMatrixDevice();

        if (device) {
            // toggle between online and silent based on running silent status
            const newState = device.isRunningSilent() ? 'online' : 'silent';

            // update the embedded item with the new wireless state
            await actor.updateEmbeddedDocuments('Item', [{
                '_id': device._id!,
                system: { technology: { wireless: newState } }
            }]);
        } else {
            // if the actor doesn't have a device, they may be a technomancer without a living persona device or is a Matrix only being
            await actor.update({
                system: {
                    matrix: {
                        running_silent: !actor.isRunningSilent(),
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
