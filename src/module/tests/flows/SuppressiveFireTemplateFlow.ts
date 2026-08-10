import { TestDialogListener } from '../../apps/dialogs/TestDialog';
import { FireModeType } from '../../types/flags/ItemFlags';
import { TestCreator } from '../TestCreator';

interface SuppressiveFireTemplateFlowHost {
    actor: {
        getToken(): TokenDocument | null
    } | undefined
    data: {
        fireMode: FireModeType
        suppressiveFireWidth: number
    }
}

interface SuppressiveFireTest extends SuppressiveFireTemplateFlowHost {
    populateDocuments(): Promise<void>
    suppressiveFireTemplateFlow: SuppressiveFireTemplateFlow
}

type Point = { x: number, y: number };

// TODO: fvtt-types v14 BaseShapeData lacks the updateSource declaration used by Region placement.
type RegionShape = {
    updateSource: (data: Record<string, unknown>) => void
};

// TODO: fvtt-types v14 RegionLayer lacks the placeRegion and _cancelPlacement declarations.
type RegionLayerV14 = typeof canvas.regions & {
    placeRegion: (data: Record<string, unknown>, options: {
        create: boolean
        allowRotation: boolean
        onMove: (args: { position: Point, shape: RegionShape }) => false
    }) => Promise<foundry.documents.RegionDocument | null>
    _cancelPlacement?: () => void
};

/** Handles the placement of a suppressive-fire cone with a selected outer width. */
export class SuppressiveFireTemplateFlow {
    #placement?: Promise<foundry.documents.RegionDocument | null>;
    #placedRegionId?: string;
    #base!: Point;
    #width = 10;

    constructor(private readonly test: SuppressiveFireTemplateFlowHost) { }

    get canPlace(): boolean {
        return this.test.data.fireMode.suppression === true;
    }

    dialogListeners(getMeters: () => number): TestDialogListener[] {
        return [{
            query: '#show-suppressive-fire-template',
            on: 'click',
            callback: (event: JQuery.Event) => { void this.showPreview(event, getMeters()); }
        }];
    }

    async showPreview(event: JQuery.Event, meters: number) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.canPlace) return;
        if (this.#placement) {
            this.cancelPreview();
            return;
        }

        await this.#startPreview(meters);
    }

    async drawChatPreview() {
        if (this.#placement) {
            this.cancelPreview();
            return;
        }

        await this.#startPreview(this.test.data.suppressiveFireWidth);
    }

    static async drawChatPreviewFromMessage(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        const element = $(event.currentTarget as HTMLElement);
        const card = element.closest<HTMLElement>('.chat-message');
        const messageId = card[0]?.dataset.messageId;
        if (!messageId) return;
        const test = await TestCreator.fromMessage(messageId) as SuppressiveFireTest | undefined;
        if (!test) return;

        await test.populateDocuments();
        await test.suppressiveFireTemplateFlow.drawChatPreview();
    }

    static chatMessageListeners(html: HTMLElement | JQuery) {
        $(html).find('.place-suppressive-fire-template').on('click', this.drawChatPreviewFromMessage);
    }

    async #startPreview(meters: number) {
        if (!canvas.ready || !canvas.regions) return;

        const token = this.test.actor?.getToken();
        if (!token) {
            ui.notifications?.warn('SR5.TargetingNeedsActorWithToken', { localize: true });
            return;
        }

        const gridSize = canvas.grid?.size;
        if (!gridSize) return;

        const scene = canvas.scene;
        if (!scene) return;

        if (this.#placedRegionId) {
            await scene.deleteEmbeddedDocuments('Region', [this.#placedRegionId]);
            this.#placedRegionId = undefined;
        }

        this.#base = {
            x: token.x + token.width * gridSize / 2,
            y: token.y + token.height * gridSize / 2,
        };
        this.#width = meters;

        const regions = canvas.regions as RegionLayerV14;
        this.#placement = regions.placeRegion({
            name: game.i18n.localize('SR5.SuppressiveFire.Label'),
            color: game.user?.color?.toString() ?? '#ffffff',
            shapes: [{
                type: 'cone',
                x: this.#base.x,
                y: this.#base.y,
                radius: 1,
                angle: 0,
                rotation: 0,
                curvature: 'round',
                gridBased: false,
            }],
            elevation: {bottom: null, top: null, topInclusive: null},
            levels: [],
            visibility: CONST.REGION_VISIBILITY.ALWAYS,
            restriction: {enabled: false, type: 'move', priority: 0},
            attachment: {token: null},
            highlightMode: 'coverage',
            displayMeasurements: true,
            behaviors: [],
            ownership: {[game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER},
        }, {
            create: true,
            allowRotation: false,
            onMove: ({position, shape}) => {
                this.#updateShape(shape, position);
                return false;
            },
        }).then(region => {
            this.#placement = undefined;
            if (region?.id) this.#placedRegionId = region.id;
            return region;
        }).catch(error => {
            this.#placement = undefined;
            console.error('Suppressive fire Region placement failed', error);
            return null;
        });
    }

    cancelPreview() {
        if (!this.#placement) return;

        const regions = canvas.regions as RegionLayerV14;
        regions._cancelPlacement?.();
        this.#placement = undefined;
    }

    finalizePreview() {
        this.cancelPreview();
    }

    #updateShape(shape: RegionShape, pointer: Point) {
        const distancePixels = Math.hypot(pointer.x - this.#base.x, pointer.y - this.#base.y);
        const radius = Math.max(distancePixels, 1);
        const distance = radius / canvas.dimensions!.distancePixels;
        const angle = Math.atan2(pointer.y - this.#base.y, pointer.x - this.#base.x);
        const effectiveWidth = Math.min(this.#width, distance * Math.PI * 2);
        const coneAngle = effectiveWidth / distance * 180 / Math.PI;
        shape.updateSource({
            x: this.#base.x,
            y: this.#base.y,
            radius,
            angle: coneAngle,
            rotation: angle * 180 / Math.PI,
        });
    }
}