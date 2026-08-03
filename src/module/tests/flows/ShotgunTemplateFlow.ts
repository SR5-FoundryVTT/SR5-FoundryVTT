import { TestDialogListener } from '../../apps/dialogs/TestDialog';
import { getWeaponRangeCircleLayout, WEAPON_RANGE_COLORS } from '../../WeaponRangeOverlay';
import { RangesTemplateType } from '../../types/template/Weapon';
import { ShotgunChoke } from '../../rules/FireModeRules';

interface ShotgunTemplateFlowHost {
    actor: {
        getToken(): TokenDocument | null
    } | undefined
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
    #placedTemplateIds: string[] = [];
    #base!: Point;
    #direction = 0;
    #hoveredRangeIndex = -1;
    #ranges!: RangesTemplateType;
    #choke: ShotgunChoke = 'medium';
    #events?: {
        move: (event: PIXI.FederatedPointerEvent) => void
        confirm: (event: PIXI.FederatedPointerEvent) => void
        cancel: (event: MouseEvent) => void
    };

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

        if (this.#preview) {
            this.cancelPreview();
            return;
        }

        if (!canvas.ready || !canvas.templates) return;

        const token = this.test.actor?.getToken();
        if (!token) {
            ui.notifications?.warn('SR5.TargetingNeedsActorWithToken', { localize: true });
            return;
        }

        const gridSize = canvas.grid?.size;
        const scene = canvas.scene;
        if (!gridSize || !scene) return;

        if (this.#placedTemplateIds.length > 0) {
            await scene.deleteEmbeddedDocuments('MeasuredTemplate', this.#placedTemplateIds);
            this.#placedTemplateIds = [];
        }

        this.#base = {
            x: token.x + token.width * gridSize / 2,
            y: token.y + token.height * gridSize / 2,
        };
        this.#direction = 0;
        this.#hoveredRangeIndex = -1;
        this.#ranges = ranges;
        this.#choke = choke;
        this.#preview = canvas.templates.addChild(new PIXI.Container());
        this.#graphics = this.#preview.addChild(new PIXI.Graphics());
        this.#rangeLabels = RANGE_KEYS.map(() => this.#preview!.addChild(this.#createLabel()));
        this.#bindPreviewListeners();
    }

    cancelPreview() {
        this.#unbindPreviewListeners();
        this.#preview?.destroy();
        this.#preview = undefined;
        this.#graphics = undefined;
        this.#rangeLabels = [];
        this.#hoveredRangeIndex = -1;
    }

    async finalizePreview() {
        if (!this.#preview) {
            this.cancelPreview();
            return;
        }

        await this.#place();
    }

    #bindPreviewListeners() {
        this.#events = {
            move: event => {
                event.stopPropagation();
                this.#drawShotgunTemplate(event.data.getLocalPosition(canvas.templates!));
            },
            confirm: event => {
                if (event.button !== 0) return;

                event.stopPropagation();
                const pointer = event.data.getLocalPosition(canvas.templates!);
                this.#drawShotgunTemplate(pointer);
                void this.#place();
            },
            cancel: event => {
                event.preventDefault();
                event.stopPropagation();
                this.cancelPreview();
            },
        };

        canvas.stage?.on('mousemove', this.#events.move);
        canvas.stage?.on('mousedown', this.#events.confirm);
        canvas.app!.view.oncontextmenu = this.#events.cancel;
    }

    #unbindPreviewListeners() {
        if (!this.#events) return;

        canvas.stage?.off('mousemove', this.#events.move);
        canvas.stage?.off('mousedown', this.#events.confirm);
        if (canvas.app?.view.oncontextmenu === this.#events.cancel)
            canvas.app.view.oncontextmenu = null;
        this.#events = undefined;
    }

    async #place() {
        if (!this.#base) return;

        const scene = canvas.scene;
        if (!scene) return;

        const distancePixels = canvas.dimensions!.distancePixels;
        const direction = this.#direction * Math.PI / 180;
        const rangeIndex = this.#hoveredRangeIndex < 0 ? 0 : this.#hoveredRangeIndex;
        const key = RANGE_KEYS[rangeIndex];
        const startDistance = rangeIndex === 0 ? 0 : this.#ranges[RANGE_KEYS[rangeIndex - 1]].distance;
        const endDistance = this.#ranges[key].distance;
        const templateData = {
            t: 'ray' as const,
            user: game.user?.id,
            x: this.#base.x + Math.cos(direction) * startDistance * distancePixels,
            y: this.#base.y + Math.sin(direction) * startDistance * distancePixels,
            direction: this.#direction,
            distance: endDistance - startDistance,
            width: this.#getSpread(rangeIndex),
            fillColor: game.user?.color?.toString() ?? '#ffffff',
        };
        this.cancelPreview();
        const placedTemplates = await scene.createEmbeddedDocuments('MeasuredTemplate', [templateData]);
        this.#placedTemplateIds = placedTemplates.map(template => template.id);
    }

    #drawShotgunTemplate(pointer: Point) {
        const graphics = this.#graphics;
        if (!graphics) return;

        const angle = Math.atan2(pointer.y - this.#base.y, pointer.x - this.#base.x);
        this.#direction = angle * 180 / Math.PI;
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