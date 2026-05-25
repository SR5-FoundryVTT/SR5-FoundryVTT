import { MatrixOpposedDeviceDialog, MatrixOpposedDeviceDialogSelection } from '@/module/apps/dialogs/MatrixOpposedDeviceDialog';
import { SR5 } from '@/module/config';
import { DataDefaults } from '@/module/data/DataDefaults';
import { Helpers } from '@/module/helpers';
import { SR5Item } from '@/module/item/SR5Item';
import { MatrixNetworkFlow } from '@/module/item/flows/MatrixNetworkFlow';
import { SR5Actor } from '@/module/actor/SR5Actor';

export const MatrixOpposedTargetFlow = {
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
            name: '',
            category: 'device',
            rating: 1,
            description: '',
            networkUuid: selectedNetworkUuid,
        }, {
            networks,
        });

        const selection = await dialog.select() as MatrixOpposedDeviceDialogSelection;
        if (dialog.canceled || dialog.selectedButton !== 'confirm') return null;
        if (!selection.name || !selection.category) return null;

        return {
            ...selection,
            rating: Math.max(1, Math.floor(selection.rating || 1)),
        };
    },

    async createTemporaryDevice(selection: MatrixOpposedDeviceDialogSelection): Promise<SR5Item<'device'> | null> {
        if (!game.user?.isGM) return null;

        const system = DataDefaults.baseSystemData('device', {
            category: selection.category,
            managed: {
                onScene: canvas.scene?.uuid ?? '',
                byUser: game.user?.uuid ?? '',
                createAt: new Date().toISOString(),
            },
            technology: {
                rating: selection.rating,
                wireless: 'online',
                quantity: 1,
                cost: 0,
                availability: '',
                equipped: true,
            },
            description: {
                value: selection.description,
                source: game.i18n.localize(SR5.deviceCategories[selection.category]),
            },
            importFlags: {
                name: selection.name,
                category: selection.category,
                sourceid: 'matrix-opposed-temp-device',
            }
        });

        const item = await SR5Item.create({
            name: selection.name,
            type: 'device',
            system,
        }) as SR5Item<'device'> | null;

        if (item && selection.networkUuid) {
            const networkUuid = String(selection.networkUuid);
            const network = await fromUuid<SR5Item>(networkUuid);
            if (network?.isNetwork()) {
                await MatrixNetworkFlow.addSlave(network, item);
            }
        }

        return item;
    }
};