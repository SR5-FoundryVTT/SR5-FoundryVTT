import { TestDialogLike, TestDialogListener } from '../../apps/dialogs/TestDialog';
import { SR5Actor } from '../../actor/SR5Actor';
import { SR5Item } from '../../item/SR5Item';
import { getBlastCircleLayout, getBlastDamageAtDistance, BlastTemplateData } from '../../regions/BlastTemplate';
import { TestCreator } from '../TestCreator';
import type { SuccessTest } from '../SuccessTest';

const BLAST_FILL_COLORS = [0xcc3333, 0xd9b300, 0x33aa33] as const;
const BLAST_FILL_ALPHA = 0.2;
const DEFAULT_BORDER_COLOR = 0x000000;

type Point = { x: number, y: number };
type RegionShapeData = { x?: number, y?: number, [key: string]: unknown };
type RegionShape = {
    updateSource: (data: Record<string, unknown>) => void
};
type RegionPlacementEvent = PIXI.FederatedPointerEvent & {
    getLocalPosition: (displayObject: PIXI.DisplayObject) => Point
};

// TODO: fvtt-types v14 RegionLayer lacks the placeRegion, preview, and _cancelPlacement declarations.
type RegionLayerV14 = typeof canvas.regions & {
    preview: PIXI.Container
    placeRegion: (data: Record<string, unknown>, options: {
        create: boolean
        allowRotation: boolean
        _destroyPreview?: boolean
        onMove: (args: { position: Point, shape: RegionShape }) => false
        preConfirm?: (args: { event: RegionPlacementEvent, shape: RegionShape }) => void
    }) => Promise<foundry.documents.RegionDocument | null>
    _cancelPlacement?: () => void
};

// TODO: fvtt-types v14 omits the Region createEmbeddedDocuments controlObject option.
type RegionCreateEmbeddedDocuments = (
    embeddedName: 'Region',
    data: object[],
    options: {controlObject: boolean}
) => Promise<foundry.documents.RegionDocument[]>;

interface BlastTemplateFlowHost {
    actor: SR5Actor | undefined
    item: SR5Item | undefined
    data: {
        targetUuids: string[]
        targetActorsUuid: string[]
        damage?: { value: number, type?: { value: string } }
    }
    targets: (SR5Actor | SR5Item | TokenDocument)[]
}

interface BlastTemplateFlowOptions {
    getBlastData?: () => { radius: number, dropoff: number } | undefined
    prepareTargetData?: () => void
}

type TestWithBlastTemplateFlow = SuccessTest & BlastTemplateFlowHost & {
    blastTemplateFlow?: BlastTemplateFlow
    populateDocuments: () => Promise<void>
};

type BlastTemplatePlacementCallback = (test: SuccessTest) => void | Promise<void>;

/**
 * Handles item area-template previews for tests that opt into this behavior.
 */
export class BlastTemplateFlow {
    #placement?: Promise<foundry.documents.RegionDocument | null>;
    #selectedRegion?: foundry.documents.RegionDocument;
    #overlay?: PIXI.Container;
    #graphics?: PIXI.Graphics;
    #blastTokenDamageLabels: foundry.canvas.containers.PreciseText[] = [];
    #center: Point = {x: 0, y: 0};
    #blastData?: BlastTemplateData;
    #placedRegion?: foundry.documents.RegionDocument;
    #placedRegionOrigin?: Point;

    constructor(
        private readonly test: BlastTemplateFlowHost,
        private readonly options: BlastTemplateFlowOptions = {}
    ) { }

    get canPlace(): boolean {
        return this.test.item?.hasBlastTemplate ?? false;
    }

    get placedRegion(): foundry.documents.RegionDocument | undefined {
        return this.#placedRegion;
    }

    get placedRegionOrigin(): Point | undefined {
        return this.#placedRegionOrigin;
    }

    async movePlacedRegion(offset: Point): Promise<void> {
        const region = this.#placedRegion;
        const origin = this.#placedRegionOrigin;
        if (!region || !origin) return;

        const regionData = region.toObject() as { shapes?: RegionShapeData[] };
        const shapes = regionData.shapes;
        if (!shapes?.length) return;

        const [shape, ...remainingShapes] = shapes;
        const updateData = {
            shapes: [{
                ...shape,
                x: origin.x + offset.x,
                y: origin.y + offset.y,
            }, ...remainingShapes],
        } as unknown as Parameters<typeof region.update>[0];
        await region.update(updateData);
    }

    dialogListeners(): TestDialogListener[] {
        return [{
            query: '#show-blast-template',
            on: 'click',
            callback: this.showPreview.bind(this)
        }];
    }

    showPreview(event: JQuery.Event, dialog: TestDialogLike) {
        event.preventDefault();
        event.stopPropagation();

        if (this.#placement || this.#selectedRegion) {
            void this.cancelPreview();
            return;
        }

        dialog.applyFormData?.();
        if (!this.test.item || !this.canPlace) return;

        void this.#startPreview(false, dialog);
    }

    private selectTarget(token: TokenDocument, dialog: TestDialogLike) {
        if (!token.uuid) return;

        this.test.data.targetUuids = [token.uuid];
        this.test.data.targetActorsUuid = token.actor?.uuid ? [token.actor.uuid] : [];
        this.test.targets = [token];
        this.options.prepareTargetData?.();
        void dialog.render({force: true});
    }

    private clearPreviewState() {
        this.#overlay?.destroy({children: true});
        this.#overlay = undefined;
        this.#graphics = undefined;
        this.#blastTokenDamageLabels = [];
        this.#selectedRegion?.object?.destroy({children: true});
        this.#selectedRegion = undefined;
    }

    async cancelPreview() {
        if (this.#placement) {
            const placement = this.#placement;
            this.#placement = undefined;
            (canvas.regions as RegionLayerV14)._cancelPlacement?.();
            await placement;
        }
        this.clearPreviewState();
    }

    async finalizePreview() {
        if (!this.#selectedRegion) {
            await this.cancelPreview();
            return;
        }

        const region = this.#selectedRegion;
        const scene = canvas.scene;
        if (scene) {
            const createEmbeddedDocuments = scene.createEmbeddedDocuments.bind(scene) as unknown as RegionCreateEmbeddedDocuments;
            const [placedRegion] = await createEmbeddedDocuments('Region', [region.toObject()], {controlObject: true});
            if (placedRegion) this.#rememberPlacedRegion(placedRegion);
        }
        this.clearPreviewState();
    }

    async drawChatPreview(): Promise<foundry.documents.RegionDocument | undefined> {
        if (!this.test.item || !this.canPlace) return;
        if (this.#placement || this.#selectedRegion) {
            await this.cancelPreview();
            return;
        }

        return (await this.#startPreview(true)) ?? undefined;
    }

    static async drawChatPreviewFromMessage(event: Event | JQuery.ClickEvent): Promise<SuccessTest | undefined> {
        event.preventDefault();
        event.stopPropagation();

        const element = $(event.currentTarget as HTMLElement);
        const card = element.closest<HTMLElement>('.chat-message');
        const messageId = card[0]?.dataset.messageId;
        if (!messageId) return;
        const test = await TestCreator.fromMessage(messageId) as TestWithBlastTemplateFlow | undefined;
        if (!test) return;

        await test.populateDocuments();
        const blastTemplateFlow = test.blastTemplateFlow;
        if (!blastTemplateFlow) return;

        const placedRegion = await blastTemplateFlow.drawChatPreview();
        return placedRegion ? test : undefined;
    }

    static chatMessageListeners(html: HTMLElement | JQuery, onPlaced?: BlastTemplatePlacementCallback) {
        $(html).find('.place-template').on('click', async event => {
            const test = await this.drawChatPreviewFromMessage(event);
            if (test) await onPlaced?.(test);
        });
    }

    get blastData() {
        return this.options.getBlastData?.() ?? this.test.item?.getBlastData();
    }

    get previewData(): BlastTemplateData | undefined {
        const blast = this.blastData;
        if (!blast) return undefined;

        return {
            ...blast,
            damageValue: this.test.data.damage?.value,
            damageType: this.test.data.damage?.type?.value,
        };
    }

    #startPreview(persistOnConfirm: boolean, dialog?: TestDialogLike): Promise<foundry.documents.RegionDocument | null> | undefined {
        if (!canvas.ready || !canvas.regions || !canvas.grid || !canvas.dimensions) return;

        const blast = this.previewData;
        const regions = canvas.regions as RegionLayerV14;
        this.#blastData = blast;
        this.#center = {x: 0, y: 0};

        const placement = regions.placeRegion({
            name: game.i18n.localize('SR5.PlaceTemplate'),
            color: game.user?.color?.toString() ?? '#ffffff',
            shapes: [{
                type: 'circle',
                x: 0,
                y: 0,
                radius: (blast?.radius || 1) * canvas.dimensions.distancePixels,
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
            create: persistOnConfirm,
            allowRotation: false,
            _destroyPreview: persistOnConfirm,
            onMove: ({position, shape}) => {
                this.#updateCircle(shape, position);
                return false;
            },
            preConfirm: persistOnConfirm ? undefined : ({event, shape}) => {
                this.#updateCircle(shape, event.getLocalPosition(regions));
                const token = this.#getTokenAtPoint(event);
                if (token?.id) {
                    canvas.tokens?.setTargets([token.id], {mode: event.shiftKey ? 'acquire' : 'replace'});
                    this.selectTarget(token, dialog!);
                }
            },
        });

        this.#placement = placement.then(region => {
            this.#placement = undefined;
            if (persistOnConfirm && region) this.#rememberPlacedRegion(region);
            if (!persistOnConfirm && region) this.#selectedRegion = region;
            this.#overlay?.destroy({children: true});
            this.#overlay = undefined;
            this.#graphics = undefined;
            this.#blastTokenDamageLabels = [];
            return region;
        }).catch(error => {
            this.#placement = undefined;
            console.error('Blast Region placement failed', error);
            this.clearPreviewState();
            return null;
        });

        this.#overlay = regions.preview.addChild(new PIXI.Container());
        this.#graphics = this.#overlay.addChild(new PIXI.Graphics());
        this.#refreshBlastOverlay();

        return this.#placement;
    }

    #rememberPlacedRegion(region: foundry.documents.RegionDocument) {
        this.#placedRegion = region;
        const shape = region.toObject().shapes?.[0] as RegionShapeData | undefined;
        if (shape && typeof shape.x === 'number' && typeof shape.y === 'number') {
            this.#placedRegionOrigin = {x: shape.x, y: shape.y};
        }
    }

    #updateCircle(shape: RegionShape, position: Point) {
        const snapped = canvas.grid!.getSnappedPoint(position, {mode: CONST.GRID_SNAPPING_MODES.CENTER});
        shape.updateSource({x: snapped.x, y: snapped.y});
        this.#center = snapped;
        this.#refreshBlastOverlay();
    }

    #refreshBlastOverlay() {
        if (!this.#blastData || !this.#graphics || !this.#overlay || !canvas.dimensions) return;

        const scale = canvas.dimensions.uiScale;
        const layout = getBlastCircleLayout(this.#blastData, canvas.dimensions.distancePixels);
        const graphics = this.#graphics.clear();
        this.#overlay.position.set(this.#center.x, this.#center.y);

        layout.forEach((circle, index) => {
            graphics.beginFill(BLAST_FILL_COLORS[index % BLAST_FILL_COLORS.length], BLAST_FILL_ALPHA)
                .drawCircle(0, 0, circle.radius);
            if (index > 0) {
                graphics.beginHole()
                    .drawCircle(0, 0, layout[index - 1].radius)
                    .endHole();
            }
            graphics.endFill();
            graphics.lineStyle(3 * scale, DEFAULT_BORDER_COLOR, 0.9).drawCircle(0, 0, circle.radius);
        });

        this.#refreshTokenDamageLabels(scale);
    }

    #refreshTokenDamageLabels(scale: number) {
        for (const label of this.#blastTokenDamageLabels) {
            this.#overlay?.removeChild(label);
            label.destroy();
        }
        this.#blastTokenDamageLabels = [];

        if (!this.#blastData || this.#blastData.dropoff >= 0 || !this.#overlay) return;

        for (const token of canvas.tokens?.placeables ?? []) {
            if (!token.visible || !token.renderable) continue;

            const distance = canvas.grid!.measurePath([
                this.#center,
                token.center,
            ], {}).distance;
            const damage = getBlastDamageAtDistance(this.#blastData, distance);
            if (damage === undefined) continue;

            const label = this.#overlay.addChild(this.#createBlastLabel());
            this.#refreshBlastLabel(label, `${damage}${this.#getDamageCode(this.#blastData.damageType)}`, {
                x: token.center.x - this.#center.x,
                y: token.y - this.#center.y - (24 / scale),
            }, scale);
            this.#blastTokenDamageLabels.push(label);
        }
    }

    #getTokenAtPoint(event: RegionPlacementEvent): TokenDocument | undefined {
        const resolution = canvas.app?.renderer?.resolution ?? 1;
        const point = {
            x: event.global.x * resolution,
            y: event.global.y * resolution,
        };
        const token = event.target instanceof foundry.canvas.placeables.Token ?
            event.target :
            canvas.tokens?.placeables.find(candidate => {
                if (!candidate.visible || !candidate.renderable) return false;
                return candidate.getBounds().contains(point.x, point.y);
            });
        return token?.document;
    }

    #getDamageCode(damageType?: string) {
        const key = {
            physical: 'SR5.DmgCodePhysical',
            stun: 'SR5.DmgCodeStun',
            matrix: 'SR5.DmgCodeMatrix',
        }[damageType ?? ''];
        if (key) return game.i18n.localize(key);
        return damageType?.charAt(0).toUpperCase() ?? '';
    }

    #createBlastLabel() {
        const label = new foundry.canvas.containers.PreciseText('', CONFIG.canvasTextStyle);
        label.anchor.set(0.5);
        return label;
    }

    #refreshBlastLabel(label: foundry.canvas.containers.PreciseText, text: string, position: Point, scale: number) {
        label.text = text;
        label.position.set(position.x, position.y);
        label.scale.set(scale);
    }
}
