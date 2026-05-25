import { PromptDialog, PromptDialogData } from '@/module/apps/dialogs/PromptDialog';
import { SR5 } from '@/module/config';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { SR5Item } from '@/module/item/SR5Item';
import { DevicePartData } from '@/module/types/item/Device';
import { DeepPartial } from 'fvtt-types/utils';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
const { StringField, NumberField, HTMLField } = foundry.data.fields;
const FilePicker = foundry.applications.apps.FilePicker.implementation;

const DEFAULT_DEVICE_IMAGE = 'systems/shadowrun5e/dist/icons/importer/device.svg';

export interface MatrixOpposedDeviceDialogSelection {
    img: string
    name: string
    category: keyof typeof SR5.deviceCategories
    rating: number
    description: string
    networkUuid: string
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
    rootId: string
}

const matrixOpposedDeviceDialogFields = {
    name: new StringField({ required: true, blank: false, initial: '' }),
    category: DevicePartData().category,
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1 }),
    description: new HTMLField({ required: true, initial: '' }),
};

export class MatrixOpposedDeviceDialog extends PromptDialog {
    constructor(selection: MatrixOpposedDeviceDialogSelection, options: MatrixOpposedDeviceDialogOptions) {
        const networkChoices = Object.fromEntries(options.networks.map(network => [network.uuid ?? '', network.name]));
        const templateData: MatrixOpposedDeviceDialogTemplateData = {
            data: selection,
            namePlaceholder: game.i18n.localize(SR5.itemTypes.device),
            imageAlt: game.i18n.localize(SR5.itemTypes.device),
            fields: {
                ...matrixOpposedDeviceDialogFields,
                networkUuid: createNetworkUuidField(networkChoices, selection.networkUuid)
            },
            networks: options.networks,
            rootId: 'matrix-opposed-device-dialog',
        };

        const data: PromptDialogData = {
            title: 'Matrix Opposed Device',
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

        super(data, {
            classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'form-dialog', 'matrix-opposed-device-dialog'],
            position: {
                width: 420,
                height: 'auto',
            }
        });
    }

    protected override async _onRender(
        context: DeepPartial<foundry.applications.api.HandlebarsApplicationMixin.RenderContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        await super._onRender(context, options);

        const image = this.element.querySelector<HTMLImageElement>('.matrix-opposed-device-header__image');
        if (!image) return;

        image.addEventListener('click', event => {
            event.preventDefault();
            void this.#editImage(image);
        });
    }

    async #editImage(target: HTMLImageElement) {
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
}

export { DEFAULT_DEVICE_IMAGE };