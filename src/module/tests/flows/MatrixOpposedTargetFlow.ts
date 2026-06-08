import { MatrixOpposedDeviceDialog, MatrixOpposedDeviceDialogSelection } from '@/module/apps/dialogs/MatrixOpposedDeviceDialog';
import { SR5 } from '@/module/config';
import { Helpers } from '@/module/helpers';
import { SR5Item } from '@/module/item/SR5Item';
import { MatrixNetworkFlow } from '@/module/item/flows/MatrixNetworkFlow';
import { SR5Actor } from '@/module/actor/SR5Actor';

type CompendiumDeviceSourceData = {
    name?: string;
    img?: string;
    type?: string;
    system?: {
        category?: keyof typeof SR5.deviceCategories;
        technology?: Record<string, unknown> & { rating?: number };
        description?: Record<string, unknown> & { value?: string; source?: string };
        importFlags?: Record<string, unknown>;
        [key: string]: unknown;
    };
    [key: string]: unknown;
};


/**
 * Handle everything related to general matrix opposed test functionality and data flow.
 */
export const MatrixOpposedTargetFlow = {
    defaultDeviceName(): string {
        return game.i18n.localize(SR5.itemTypes.device);
    },

    async resolveOpposedDocument(document: foundry.abstract.Document.Any | null | undefined, caster?: SR5Actor): Promise<foundry.abstract.Document.Any | null> {
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
        const selectedNetworkUuid = networks.some(network => network.uuid === connectedNetworkUuid)
            ? connectedNetworkUuid
            : networks[0]?.uuid ?? '';

        const dialog = new MatrixOpposedDeviceDialog({
            networkUuid: selectedNetworkUuid,
        }, {
            networks,
        });

        const selection = await dialog.select() as MatrixOpposedDeviceDialogSelection;
        if (dialog.canceled || dialog.selectedButton !== 'confirm') return null;

        const name = selection.name.trim() || this.defaultDeviceName();
        if (!selection.category) return null;

        return {
            ...selection,
            name,
            rating: Math.max(1, Math.floor(selection.rating || 1)),
        };
    },

    async createTemporaryDevice(selection: MatrixOpposedDeviceDialogSelection): Promise<SR5Item<'device'> | null> {
        if (!game.user?.isGM) return null;

        const name = selection.name.trim() || this.defaultDeviceName();
        const sourceData = MatrixOpposedTargetFlow.createTemporaryDeviceData(selection);
        const itemData = foundry.utils.mergeObject(sourceData, {
            name,
            img: selection.img || sourceData.img,
            type: 'device',
            system: foundry.utils.mergeObject(sourceData.system ?? {}, {
                category: selection.category,
                managed: {
                    onScene: canvas.scene?.uuid ?? '',
                    byUser: game.user?.uuid ?? '',
                    createAt: new Date().toISOString(),
                },
                technology: {
                    ...(sourceData.system?.technology ?? {}),
                    rating: Math.max(1, Math.floor(Number(selection.rating || sourceData.system?.technology?.rating || 1))),
                },
                description: {
                    ...(sourceData.system?.description ?? {}),
                    value: selection.description || sourceData.system?.description?.value || '',
                    source: sourceData.system?.description?.source ?? game.i18n.localize(SR5.deviceCategories[selection.category]),
                },
                importFlags: {
                    ...(sourceData.system?.importFlags ?? {}),
                    name,
                    category: selection.category,
                    sourceid: 'matrix-opposed-temp-device',
                },
            }, { inplace: false }),
        }, { inplace: false, overwrite: true }) as unknown as Parameters<typeof SR5Item.create>[0];

        const item = await SR5Item.create(itemData) as SR5Item<'device'> | null;

        let connectedNetwork: SR5Item | null = null;

        if (item && selection.networkUuid) {
            const networkUuid = String(selection.networkUuid);
            const network = await fromUuid<SR5Item>(networkUuid);
            if (network?.isNetwork()) {
                await MatrixNetworkFlow.addSlave(network, item);
                connectedNetwork = network;
            }
        }

        if (item) {
            await this.sendTemporaryDeviceMessage(item, connectedNetwork);
        }

        return item;
    },

    createTemporaryDeviceData(selection: MatrixOpposedDeviceDialogSelection) {
        const sourceData = (selection.sourceData ?? {}) as CompendiumDeviceSourceData;

        return foundry.utils.mergeObject(sourceData, {
            name: selection.name || sourceData.name || '',
            img: selection.img || sourceData.img,
            type: 'device',
            system: foundry.utils.mergeObject(sourceData.system ?? {}, {
                category: selection.category || sourceData.system?.category || 'device',
                technology: foundry.utils.mergeObject(sourceData.system?.technology ?? {}, {
                    rating: Math.max(1, Math.floor(Number(selection.rating || sourceData.system?.technology?.rating || 1))),
                }, { inplace: false }),
                description: foundry.utils.mergeObject(sourceData.system?.description ?? {}, {
                    value: selection.description || sourceData.system?.description?.value || '',
                }, { inplace: false }),
            }, { inplace: false }),
        }, { inplace: false, overwrite: true }) as CompendiumDeviceSourceData;
    },



    async sendTemporaryDeviceMessage(device: SR5Item<'device'>, network: SR5Item | null): Promise<ChatMessage | null> {
        const content = await foundry.applications.handlebars.renderTemplate(
            'systems/shadowrun5e/dist/templates/chat/matrix-opposed-device-created-message.hbs',
            {
                device,
                network,
            }
        );

        const whisper = ChatMessage.getWhisperRecipients('GM').map(user => user.id);
        return (await ChatMessage.create({
            user: game.user?.id,
            speaker: {
                alias: game.user?.name,
            },
            content,
            whisper,
        })) ?? null;
    },
};