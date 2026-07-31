import { RangesTemplateType } from './types/template/Weapon';

const RANGE_KEYS = ['short', 'medium', 'long', 'extreme'] as const;
const BORDER_LABEL_ANGLES = [-Math.PI / 4, Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4];
const RANGE_COLORS = [0x33aa33, 0xd9b300, 0xcc3333, 0x7b3fb2];
const RANGE_FILL_ALPHA = 0.2;

export type WeaponRangeCircleLayout = {
    key: typeof RANGE_KEYS[number]
    radius: number
    borderLabel: string
    borderPositions: { x: number, y: number }[]
    modifierLabel: string
    modifierPositions: { x: number, y: number }[]
};

/**
 * Convert weapon range data into canvas positions without coupling range rules to PIXI.
 */
export const getWeaponRangeCircleLayout = (
    ranges: RangesTemplateType,
    distancePixels: number,
    unit: string,
): WeaponRangeCircleLayout[] => {
    let previousRadius = 0;

    return RANGE_KEYS.map(key => {
        const range = ranges[key];
        const radius = range.distance * distancePixels;
        const modifierRadius = previousRadius + ((radius - previousRadius) / 2);
        previousRadius = radius;

        return {
            key,
            radius,
            borderLabel: `${range.label ?? key}: ${range.distance} ${unit}`,
            borderPositions: BORDER_LABEL_ANGLES.map(angle => ({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
            })),
            modifierLabel: range.modifier > 0 ? `+${range.modifier}` : String(range.modifier),
            modifierPositions: BORDER_LABEL_ANGLES.map(angle => ({
                x: modifierRadius * Math.cos(angle),
                y: modifierRadius * Math.sin(angle),
            })),
        };
    });
};

/**
 * A transient Foundry v14 measured-template overlay for displaying weapon range bands.
 *
 * MeasuredTemplate is deprecated in v14 but remains the canvas primitive for this preview
 * through v16. Keep all API-sensitive drawing and placement code isolated here.
 */
export class WeaponRangeMeasuredTemplate extends foundry.canvas.placeables.MeasuredTemplate {
    readonly ranges: RangesTemplateType;

    #rangeGraphics!: PIXI.Graphics;
    #borderLabels: PIXI.Text[][] = [];
    #modifierLabels: PIXI.Text[][] = [];
    #overlayGroup?: PIXI.Container;
    #removeOnRightClick?: (event: PIXI.FederatedPointerEvent) => void;

    // eslint-disable-next-line @typescript-eslint/no-deprecated -- MeasuredTemplate remains the v14-v16 preview primitive.
    constructor(document: MeasuredTemplateDocument, ranges: RangesTemplateType) {
        super(document);
        this.ranges = ranges;
    }

    override async _draw(options: Record<string, never>) {
        await super._draw(options);
        this.#rangeGraphics = this.addChild(new PIXI.Graphics());

        RANGE_KEYS.forEach(() => {
            this.#borderLabels.push(BORDER_LABEL_ANGLES.map(() => this.addChild(this.#createLabel())));
            this.#modifierLabels.push(BORDER_LABEL_ANGLES.map(() => this.addChild(this.#createLabel())));
        });
    }

    override _refreshTemplate() {
        if (!this.#rangeGraphics) return;

        const scale = canvas.dimensions!.uiScale;
        const layout = getWeaponRangeCircleLayout(this.ranges, canvas.dimensions!.distancePixels, canvas.grid?.units ?? '');
        const graphics = this.#rangeGraphics.clear();
        this.template?.clear();

        for (const [index, circle] of layout.entries()) {
            graphics.beginFill(RANGE_COLORS[index], RANGE_FILL_ALPHA)
                .drawCircle(0, 0, circle.radius);

            if (index > 0) {
                graphics.beginHole()
                    .drawCircle(0, 0, layout[index - 1].radius)
                    .endHole();
            }
            graphics.endFill();

            graphics.lineStyle(this._borderThickness * scale, this.document.borderColor, 0.9)
                .drawCircle(0, 0, circle.radius);

            for (const [labelIndex, label] of this.#borderLabels[index].entries()) {
                this.#refreshLabel(label, circle.borderLabel, circle.borderPositions[labelIndex], scale);
            }
            for (const [labelIndex, label] of this.#modifierLabels[index].entries()) {
                this.#refreshLabel(label, circle.modifierLabel, circle.modifierPositions[labelIndex], scale);
            }
        }
    }

    override highlightGrid() {
        // The core highlight fills the complete template using the user's color.
        // Range bands are drawn explicitly above with their configured colors.
    }

    override _refreshState() {
        super._refreshState();
        const alpha = this.document.hidden ? 0.5 : 1;
        this.#rangeGraphics.alpha = alpha;
        for (const label of [...this.#borderLabels.flat(), ...this.#modifierLabels.flat()]) label.alpha = alpha;
    }

    override _destroy(options: object) {
        this.#removeManualRemovalListener();
        this.#borderLabels = [];
        this.#modifierLabels = [];
        super._destroy(options);
    }

    async drawAt(position: { x: number, y: number }): Promise<void> {
        if (!canvas.ready || !canvas.templates) return;

        this.document.updateSource(position);
        await this.draw();

        this.#overlayGroup = new PIXI.Container();
        canvas.templates.addChild(this.#overlayGroup);
        this.#overlayGroup.addChild(this);
        this.#addManualRemovalListener();
    }

    remove() {
        this.#removeManualRemovalListener();
        if (this.#overlayGroup) {
            this.#overlayGroup.parent?.removeChild(this.#overlayGroup);
            this.#overlayGroup.destroy({ children: true });
            this.#overlayGroup = undefined;
        } else this.destroy();
    }

    #addManualRemovalListener() {
        this.#removeOnRightClick = event => {
            if (event.button !== 2) return;

            const position = event.getLocalPosition(this.layer);
            const radius = this.ranges.extreme.distance * canvas.dimensions!.distancePixels;
            const distance = Math.hypot(position.x - this.document.x, position.y - this.document.y);
            if (distance > radius) return;

            event.stopPropagation();
            this.remove();
        };
        canvas.stage?.on('pointerdown', this.#removeOnRightClick);
    }

    #removeManualRemovalListener() {
        if (!this.#removeOnRightClick) return;
        canvas.stage?.off('pointerdown', this.#removeOnRightClick);
        this.#removeOnRightClick = undefined;
    }

    #createLabel(): PIXI.Text {
        const style = CONFIG.canvasTextStyle.clone();
        style.align = 'center';
        style.fontSize = 16;
        style.stroke = 0x000000;
        style.strokeThickness = 4;

        const label = new PIXI.Text('', style);
        label.anchor.set(0.5);
        return label;
    }

    #refreshLabel(label: PIXI.Text, text: string, position: { x: number, y: number }, scale: number) {
        label.text = text;
        label.position.set(position.x, position.y);
        label.scale.set(scale);
    }
}