import { TestDialogListener } from '../../apps/dialogs/TestDialog';
import { getWeaponRangeCircleLayout, WEAPON_RANGE_COLORS } from '../../regions/WeaponRangeOverlay';
import { RangesTemplateType } from '../../types/template/Weapon';
import { ShotgunChoke } from '../../rules/FireModeRules';
import { TestCreator } from '../TestCreator';

interface ShotgunTemplateFlowHost {
    actor: {
        getToken(): TokenDocument | null
    } | undefined
    data: {
        ranges: RangesTemplateType
        shotgunChoke: ShotgunChoke
    }
}

interface ShotgunTest extends ShotgunTemplateFlowHost {
    populateDocuments(): Promise<void>
    shotgunTemplateFlow: ShotgunTemplateFlow
}

const FILL_ALPHA = 0.2;
const BORDER_COLOR = 0x000000;
const HOVER_LIGHTEN_AMOUNT = 0.55;
const RANGE_KEYS = ['short', 'medium', 'long', 'extreme'] as const;
const SHOTGUN_SPREADS: Record<ShotgunChoke, readonly number[]> = {
    narrow: [1, 2, 3, 4],
    medium: [2, 4, 6, 8],
    wide: [3, 6, 9, 12],
};

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

const lightenColor = (color: number): number => {
    const red = (color >> 16) & 0xff;
    const green = (color >> 8) & 0xff;
    const blue = color & 0xff;
    const lighten = (channel: number) => Math.round(channel + ((255 - channel) * HOVER_LIGHTEN_AMOUNT));

    return (lighten(red) << 16) | (lighten(green) << 8) | lighten(blue);
};

/** Handles placement of fixed-width shotgun range bands. */
export class ShotgunTemplateFlow {
    #preview?: PIXI.Container;
    #graphics?: PIXI.Graphics;
    #rangeLabels: foundry.canvas.containers.PreciseText[] = [];
    #placement?: Promise<foundry.documents.RegionDocument | null>;
    #placedRegionId?: string;
    #base!: Point;
    #hoveredRangeIndex = -1;
    #ranges!: RangesTemplateType;
    #choke: ShotgunChoke = 'medium';

    constructor(private readonly test: ShotgunTemplateFlowHost) { }

    dialogListeners(getRanges: () => RangesTemplateType, getChoke: () => ShotgunChoke): TestDialogListener[] {
        return [{
            query: '#show-shotgun-template',
            on: 'click',
            callback: (event: JQuery.Event) => { void this.showPreview(event, getRanges(), getChoke()); }
        }];
    }

    async showPreview(event: JQuery.Event, ranges: RangesTemplateType, choke: ShotgunChoke) {
        event.preventDefault();
        event.stopPropagation();

        if (this.#placement) {
            this.cancelPreview();
            return;
        }

        await this.#startPreview(ranges, choke);
    }

    async drawChatPreview(ranges = this.test.data.ranges, choke = this.test.data.shotgunChoke) {
        if (this.#placement) {
            this.cancelPreview();
            return;
        }

        await this.#startPreview(ranges, choke);
    }

    static async drawChatPreviewFromMessage(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        const element = $(event.currentTarget as HTMLElement);
        const card = element.closest<HTMLElement>('.chat-message');
        const messageId = card[0]?.dataset.messageId;
        if (!messageId) return;

        const test = await TestCreator.fromMessage(messageId) as ShotgunTest | undefined;
        if (!test) return;

        const testData = TestCreator.getTestDataFromMessage(messageId)?.data as Partial<ShotgunTemplateFlowHost['data']> | undefined;
        await test.populateDocuments();
        await test.shotgunTemplateFlow.drawChatPreview(
            testData?.ranges as RangesTemplateType,
            testData?.shotgunChoke as ShotgunChoke,
        );
    }

    static chatMessageListeners(html: HTMLElement | JQuery) {
        $(html).find('.place-shotgun-template').on('click', this.drawChatPreviewFromMessage);
    }

    async #startPreview(ranges: RangesTemplateType, choke: ShotgunChoke) {
        if (!canvas.ready || !canvas.regions) return;

        const token = this.test.actor?.getToken();
        if (!token) {
            ui.notifications?.warn('SR5.TargetingNeedsActorWithToken', { localize: true });
            return;
        }

        const gridSize = canvas.grid?.size;
        const scene = canvas.scene;
        if (!gridSize || !scene) return;

        if (this.#placedRegionId) {
            await scene.deleteEmbeddedDocuments('Region', [this.#placedRegionId]);
            this.#placedRegionId = undefined;
        }

        this.#base = {
            x: token.x + token.width * gridSize / 2,
            y: token.y + token.height * gridSize / 2,
        };
        this.#hoveredRangeIndex = -1;
        this.#ranges = ranges;
        this.#choke = choke;
        const previewLayer = canvas.regions.preview;
        if (!previewLayer) return;

        this.#preview = previewLayer.addChild(new PIXI.Container());
        this.#graphics = this.#preview.addChild(new PIXI.Graphics());
        this.#rangeLabels = RANGE_KEYS.map(() => this.#preview!.addChild(this.#createLabel()));

        const distancePixels = canvas.dimensions!.distancePixels;
        const initialPointer = {
            x: this.#base.x + distancePixels,
            y: this.#base.y,
        };
        const rangeIndex = this.#getRangeIndex(initialPointer);
        this.#drawShotgunTemplate(initialPointer);

        const regions = canvas.regions as RegionLayerV14;
        this.#placement = regions.placeRegion({
            name: game.i18n.localize('SR5.Shotgun.Label'),
            color: game.user?.color?.toString() ?? '#ffffff',
            shapes: [this.#getRegionLine(rangeIndex, 0)],
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
                const direction = Math.atan2(position.y - this.#base.y, position.x - this.#base.x);
                const pointer = {x: position.x, y: position.y};
                const nextRangeIndex = this.#getRangeIndex(pointer);
                this.#drawShotgunTemplate(pointer);
                shape.updateSource(this.#getRegionLine(nextRangeIndex, direction));
                return false;
            },
        }).then(region => {
            this.#placement = undefined;
            this.#destroyPreviewOverlay();
            if (region?.id) this.#placedRegionId = region.id;
            return region;
        }).catch(error => {
            this.#placement = undefined;
            console.error('Shotgun Region placement failed', error);
            return null;
        });
    }

    cancelPreview() {
        this.#destroyPreviewOverlay();
        if (this.#placement) {
            const regions = canvas.regions as RegionLayerV14;
            regions._cancelPlacement?.();
            this.#placement = undefined;
        }
    }

    finalizePreview() {
        this.cancelPreview();
    }

    #drawShotgunTemplate(pointer: Point) {
        const graphics = this.#graphics;
        if (!graphics) return;

        const angle = Math.atan2(pointer.y - this.#base.y, pointer.x - this.#base.x);
        this.#hoveredRangeIndex = this.#getRangeIndex(pointer);
        const distancePixels = canvas.dimensions!.distancePixels;
        const layout = getWeaponRangeCircleLayout(this.#ranges, distancePixels, canvas.grid?.units ?? '');
        graphics.clear();
        let previousRadius = 0;

        for (const [index] of RANGE_KEYS.entries()) {
            const radius = layout[index].radius;
            const bandPoints = this.#getBandPoints(angle, previousRadius, radius, this.#getSpread(index), distancePixels);
            const color = index === this.#hoveredRangeIndex
                ? lightenColor(WEAPON_RANGE_COLORS[index])
                : WEAPON_RANGE_COLORS[index];
            graphics.beginFill(color, FILL_ALPHA)
                .drawPolygon(bandPoints)
                .endFill()
                .lineStyle(2, BORDER_COLOR, 0.9)
                .drawPolygon(bandPoints);
            previousRadius = radius;

            const label = this.#rangeLabels[index];
            label.text = layout[index].borderLabel;
            label.position.set(
                this.#base.x + Math.cos(angle) * radius,
                this.#base.y + Math.sin(angle) * radius,
            );
            label.scale.set(canvas.dimensions!.uiScale);
        }
    }

    #getSpread(rangeIndex: number): number {
        return SHOTGUN_SPREADS[this.#choke][rangeIndex];
    }

    #destroyPreviewOverlay() {
        this.#preview?.destroy();
        this.#preview = undefined;
        this.#graphics = undefined;
        this.#rangeLabels = [];
        this.#hoveredRangeIndex = -1;
    }

    #getRegionLine(rangeIndex: number, direction: number): Record<string, unknown> {
        const distancePixels = canvas.dimensions!.distancePixels;
        const key = RANGE_KEYS[rangeIndex];
        const startDistance = rangeIndex === 0 ? 0 : this.#ranges[RANGE_KEYS[rangeIndex - 1]].distance;
        const endDistance = this.#ranges[key].distance;
        return {
            type: 'line',
            x: this.#base.x + Math.cos(direction) * startDistance * distancePixels,
            y: this.#base.y + Math.sin(direction) * startDistance * distancePixels,
            length: (endDistance - startDistance) * distancePixels,
            width: this.#getSpread(rangeIndex) * distancePixels,
            rotation: direction * 180 / Math.PI,
            gridBased: false,
        };
    }

    #getBandPoints(angle: number, startRadius: number, endRadius: number, width: number, distancePixels: number): number[] {
        const forward = { x: Math.cos(angle), y: Math.sin(angle) };
        const perpendicular = { x: -forward.y, y: forward.x };
        const halfWidth = width * distancePixels / 2;
        const start = {
            x: this.#base.x + forward.x * startRadius,
            y: this.#base.y + forward.y * startRadius,
        };
        const end = {
            x: this.#base.x + forward.x * endRadius,
            y: this.#base.y + forward.y * endRadius,
        };

        return [
            start.x + perpendicular.x * halfWidth, start.y + perpendicular.y * halfWidth,
            end.x + perpendicular.x * halfWidth, end.y + perpendicular.y * halfWidth,
            end.x - perpendicular.x * halfWidth, end.y - perpendicular.y * halfWidth,
            start.x - perpendicular.x * halfWidth, start.y - perpendicular.y * halfWidth,
        ];
    }

    #getRangeIndex(pointer: Point): number {
        const distance = Math.hypot(pointer.x - this.#base.x, pointer.y - this.#base.y)
            / canvas.dimensions!.distancePixels;
        const rangeIndex = RANGE_KEYS.findIndex(key => distance <= this.#ranges[key].distance);
        return rangeIndex < 0 ? RANGE_KEYS.length - 1 : rangeIndex;
    }

    #createLabel(): foundry.canvas.containers.PreciseText {
        const label = new foundry.canvas.containers.PreciseText('', CONFIG.canvasTextStyle);
        label.anchor.set(0.5);
        return label;
    }
}