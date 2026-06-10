import { PromptDialog, PromptDialogData } from '@/module/apps/dialogs/PromptDialog';
import { SR5 } from '@/module/config';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { SR5Item } from '@/module/item/SR5Item';
import { DevicePartData } from '@/module/types/item/Device';
import { CompendiumBrowser } from '../compendiumBrowser/CompendiumBrowser';
const { StringField, NumberField, HTMLField } = foundry.data.fields;
const FilePicker = foundry.applications.apps.FilePicker.implementation;


const DEFAULT_DEVICE_IMAGE = 'systems/shadowrun5e/dist/icons/importer/device.svg';

interface MatrixOpposedDeviceDialogInitialData {
    img?: string
    name?: string
    category?: keyof typeof SR5.deviceCategories
    rating?: number
    description?: string
    networkUuid?: string
}
export interface MatrixOpposedDeviceDialogSelection {
    img: string
    name: string
    category: keyof typeof SR5.deviceCategories
    rating: number
    description: string
    networkUuid: string
    sourceUuid?: string
    sourceData?: Record<string, unknown>
}

type MatrixOpposedDeviceDialogOptions = {
    networks: SR5Item[]
}

const createNetworkUuidField = (choices: Record<string, string>, initial: string) => new StringField({
    required: false,
    blank: true,
    initial,
    choices,
});

type MatrixOpposedDeviceDialogTemplateData = {
    data: MatrixOpposedDeviceDialogSelection
    namePlaceholder: string
    imageAlt: string
    fields: {
        name: InstanceType<typeof StringField>
        category: ReturnType<typeof DevicePartData>['category']
        rating: InstanceType<typeof NumberField>
        description: InstanceType<typeof HTMLField>
        networkUuid: ReturnType<typeof createNetworkUuidField>
    }
    networks: SR5Item[]
}

const matrixOpposedDeviceDialogFields = {
    name: new StringField({ required: true, blank: false, initial: '' }),
    category: DevicePartData().category,
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1 }),
    description: new HTMLField({ required: true, initial: '' }),
};

/**
 * Allow GMs to either manually enter basic device data or select a prepared compendium device
 * to add into an Matrix Opposed Test flow.
 */
export class MatrixOpposedDeviceDialog extends PromptDialog {
    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'form-dialog', 'matrix-opposed-device-dialog'],
        position: {
            width: 420,
            height: "auto" as const,
        },
        window: {
            resizable: false,
        },
        actions: {
            openCompendiumBrowser: MatrixOpposedDeviceDialog.#openCompendiumBrowser,
            editImage: MatrixOpposedDeviceDialog.#editImage
        }
    }

    constructor(initial: MatrixOpposedDeviceDialogInitialData, options: MatrixOpposedDeviceDialogOptions) {
        const networkChoices = Object.fromEntries(options.networks.map(network => [network.uuid ?? '', network.name]));

        const data = MatrixOpposedDeviceDialog.prepareData(initial);
        const templateData: MatrixOpposedDeviceDialogTemplateData = {
            data,
            namePlaceholder: game.i18n.localize(SR5.itemTypes.device),
            imageAlt: game.i18n.localize(SR5.itemTypes.device),
            fields: {
                ...matrixOpposedDeviceDialogFields,
                networkUuid: createNetworkUuidField(networkChoices, data.networkUuid)
            },
            networks: options.networks
        };

        const dialogData: PromptDialogData = {
            title: game.i18n.localize('SR5.MatrixOpposedDeviceDialog.Title'),
            templateData,
            templatePath: 'systems/shadowrun5e/dist/templates/apps/dialogs/matrix-opposed-device-dialog.hbs',
            buttons: {
                confirm: {
                    label: game.i18n.localize('SR5.Dialogs.Common.Ok')
                },
                cancel: {
                    label: game.i18n.localize('SR5.Dialogs.Common.Cancel')
                }
            },
            default: 'confirm',
            onAfterClose: () => templateData.data
        };

        super(dialogData);
    }

    static prepareData(data: MatrixOpposedDeviceDialogInitialData): MatrixOpposedDeviceDialogSelection {
        return {
            name: data.name || '',
            img: data.img || DEFAULT_DEVICE_IMAGE,
            category: data.category || 'device',
            rating: data.rating ?? 1,
            description: data.description || '',
            networkUuid: data.networkUuid || '',
        };
    }

    static async #editImage(this: MatrixOpposedDeviceDialog, event: Event, target: HTMLImageElement) {
        const templateData = this.dialogData.templateData as MatrixOpposedDeviceDialogTemplateData | undefined;
        if (!templateData) return;

        const current = templateData.data.img || DEFAULT_DEVICE_IMAGE;
        const fp = new FilePicker({
            current,
            type: 'image',
            callback: (path: string) => {
                target.src = path;
                templateData.data.img = path;
            },
            position: {
                top: (this.position.top ?? 0) + 40,
                left: (this.position.left ?? 0) + 10,
            }
        });

        await fp.browse();
    }

    static async #openCompendiumBrowser(this: MatrixOpposedDeviceDialog) {
        /** Callback handler to process returned selection document with dialog data. */
        const selectionCallback = async (entry: { uuid?: string }) => {
            const source = await fromUuid<SR5Item>(String(entry.uuid));
            // TODO: tamif - inform user about unsupported selection.
            if (source?.type !== 'device') return;

            const dialogData = this.dialogData.templateData as MatrixOpposedDeviceDialogTemplateData | undefined;
            if (!dialogData) return;

            dialogData.data.sourceUuid = String(source.uuid ?? entry.uuid ?? '');
            dialogData.data.sourceData = source.toObject(false);
            dialogData.data.img = source.img || DEFAULT_DEVICE_IMAGE;
            dialogData.data.name = source.name || '';
            dialogData.data.category = (source.system.category as keyof typeof SR5.deviceCategories | undefined) ?? 'device';
            dialogData.data.rating = Number(source.system.technology?.rating ?? 1);
            dialogData.data.description = source.system.description?.value || '';

            await this.render({ force: true });
        }

        const browser = new CompendiumBrowser()
        browser.activateSelectionMode(selectionCallback);
        browser.selectTypesFilters(['device']);
        await browser.render({ force: true });
    }
}
