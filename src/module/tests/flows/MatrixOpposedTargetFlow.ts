import { MatrixOpposedDeviceDialog, MatrixOpposedDeviceDialogSelection } from '@/module/apps/dialogs/MatrixOpposedDeviceDialog';
import { SR5 } from '@/module/config';
import { Helpers } from '@/module/helpers';
import { SR5Item } from '@/module/item/SR5Item';
import { MatrixNetworkFlow } from '@/module/item/flows/MatrixNetworkFlow';
import { SR5Actor } from '@/module/actor/SR5Actor';

/**
 * Handle everything related to general matrix opposed test functionality and data flow.
 */
export const MatrixOpposedTargetFlow = {
    defaultDeviceName(): string {
        return game.i18n.localize(SR5.itemTypes.device);
    },

    async createTemporyDocument(document: foundry.abstract.Document.Any | null | undefined, caster?: SR5Actor): Promise<foundry.abstract.Document.Any | null> {
        if (document) return document;
        if (!game.user?.isGM) return null;

        const selection = await this.promptTemporaryDeviceDetails(caster);
        if (!selection) return null;

        return this.createTemporaryDevice(selection);
    },

    availableNetworks(): SR5Item[] {
        if (!game.user?.isGM) return [];

        const networks = MatrixNetworkFlow.getNetworks()
        return networks.toSorted(Helpers.sortByName.bind(this));
    },

    async promptTemporaryDeviceDetails(caster?: SR5Actor): Promise<MatrixOpposedDeviceDialogSelection | null> {
        if (!game.user?.isGM) return null;

        const networks = this.availableNetworks();
        const connectedNetworkUuid = caster?.network?.uuid ?? '';

        const dialog = new MatrixOpposedDeviceDialog({
            networkUuid: connectedNetworkUuid,
        }, {
            networks,
        });

        const selection = await dialog.select() as MatrixOpposedDeviceDialogSelection;
        if (dialog.canceled || dialog.selectedButton !== 'confirm') return null;

        // Name and type are mandatory, assure the user doesn't clear that.
        selection.name = selection.name.trim() || this.defaultDeviceName();
        return selection;
    },

    async createTemporaryDevice(selection: MatrixOpposedDeviceDialogSelection): Promise<SR5Item<'device'> | null> {
        if (!game.user?.isGM) return null;

        const sourceData = MatrixOpposedTargetFlow.createTemporaryDeviceData(selection);
        // @ts-expect-error - Incomplete typing for createTemporaryDeviceData
        const item = await SR5Item.create(sourceData) as SR5Item<'device'> | null;
        if (!item) return null;

        let connectedNetwork: SR5Item | null = null;

        if (selection.networkUuid) {
            const networkUuid = String(selection.networkUuid);
            const network = await fromUuid<SR5Item>(networkUuid);
            if (network?.isNetwork()) {
                await MatrixNetworkFlow.addSlave(network, item);
                connectedNetwork = network;
            }
        }

        await this.sendTemporaryDeviceMessage(item, connectedNetwork);

        return item;
    },

    /**
     * Merge selection and possible selected pack items source data.
     * @param selection Selections made by the user.
     */
    createTemporaryDeviceData(selection: MatrixOpposedDeviceDialogSelection) {
        const selectionData = {
            name: selection.name,
            img: selection.img,
            type: 'device',
            system: {
                category: selection.category,
                technology: {
                    rating: selection.rating,
                    wireless: selection.wireless || 'online',
                },
                description: {
                    value: selection.description
                },
                managed: {
                    onScene: canvas.scene?.uuid ?? '',
                    byUser: game.user?.uuid ?? '',
                    createdAt: new Date().toISOString(),
                },
            }
        };

        const sourceData = selection.sourceData;
        if (!sourceData) {
            return selectionData;
        }

        return foundry.utils.mergeObject(sourceData, selectionData);
    },



    async sendTemporaryDeviceMessage(device: SR5Item<'device'>, network: SR5Item | null): Promise<ChatMessage | undefined> {
        const content = await foundry.applications.handlebars.renderTemplate(
            'systems/shadowrun5e/dist/templates/chat/matrix-opposed-device-created-message.hbs',
            {
                device,
                network,
            }
        );

        const whisper = ChatMessage.getWhisperRecipients('GM').map(user => user.id);
        return await ChatMessage.create({
            user: game.user?.id,
            speaker: {
                alias: game.user?.name,
            },
            content,
            whisper,
        })
    },
};