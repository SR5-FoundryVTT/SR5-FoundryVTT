import { RangesTemplateType } from '../types/template/Weapon';

const RANGE_KEYS = ['short', 'medium', 'long', 'extreme'] as const;
const CARDINAL_DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
] as const;
export const WEAPON_RANGE_COLORS = [0x33aa33, 0xd9b300, 0xcc3333, 0x7b3fb2] as const;
const RANGE_FILL_ALPHA = 0.2;
const DEFAULT_BORDER_COLOR = 0x000000;

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
            borderPositions: CARDINAL_DIRECTIONS.map(direction => ({
                x: radius * direction.x,
                y: radius * direction.y,
            })),
            modifierLabel: range.modifier > 0 ? `+${range.modifier}` : String(range.modifier),
            modifierPositions: CARDINAL_DIRECTIONS.map(direction => ({
                x: modifierRadius * direction.x,
                y: modifierRadius * direction.y,
            })),
        };
    });
};

/**
 * A transient canvas overlay for displaying weapon range bands.
 *
 * This deliberately has no Foundry document because it only exists while an
 * attack dialog is open and must not become a persistent scene placeable.
 */
export class WeaponRangeOverlay extends PIXI.Container {
    readonly ranges: RangesTemplateType;

    readonly #rangeGraphics: PIXI.Graphics;
    readonly #borderLabels: foundry.canvas.containers.PreciseText[][] = [];
    readonly #modifierLabels: foundry.canvas.containers.PreciseText[][] = [];
    #removeOnRightClick?: (event: PIXI.FederatedPointerEvent) => void;

    constructor(ranges: RangesTemplateType) {
        super();
        this.ranges = ranges;
        this.eventMode = 'none';
        this.#rangeGraphics = this.addChild(new PIXI.Graphics());

        RANGE_KEYS.forEach(() => {
            this.#borderLabels.push(CARDINAL_DIRECTIONS.map(() => this.addChild(this.#createLabel())));
            this.#modifierLabels.push(CARDINAL_DIRECTIONS.map(() => this.addChild(this.#createLabel())));
        });
    }

    drawAt(position: { x: number, y: number }) {
        this.position.set(position.x, position.y);
        this.#refresh();
        canvas.interface.addChild(this);
        this.#addManualRemovalListener();
    }

    remove() {
        this.#removeManualRemovalListener();
        this.parent?.removeChild(this);
        this.destroy({ children: true });
    }

    #refresh() {
        const scale = canvas.dimensions!.uiScale;
        const layout = getWeaponRangeCircleLayout(this.ranges, canvas.dimensions!.distancePixels, canvas.grid?.units ?? '');
        const graphics = this.#rangeGraphics.clear();

        for (const [index, circle] of layout.entries()) {
            graphics.beginFill(WEAPON_RANGE_COLORS[index], RANGE_FILL_ALPHA)
                .drawCircle(0, 0, circle.radius);

            if (index > 0) {
                graphics.beginHole()
                    .drawCircle(0, 0, layout[index - 1].radius)
                    .endHole();
            }
            graphics.endFill();

            graphics.lineStyle(3 * scale, DEFAULT_BORDER_COLOR, 0.9)
                .drawCircle(0, 0, circle.radius);

            for (const [labelIndex, label] of this.#borderLabels[index].entries()) {
                this.#refreshLabel(label, circle.borderLabel, circle.borderPositions[labelIndex], scale);
            }
            for (const [labelIndex, label] of this.#modifierLabels[index].entries()) {
                this.#refreshLabel(label, circle.modifierLabel, circle.modifierPositions[labelIndex], scale);
            }
        }
    }

    #addManualRemovalListener() {
        this.#removeOnRightClick = event => {
            if (event.button !== 2) return;

            const position = event.getLocalPosition(canvas.interface);
            const radius = this.ranges.extreme.distance * canvas.dimensions!.distancePixels;
            const distance = Math.hypot(position.x - this.position.x, position.y - this.position.y);
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

    #createLabel(): foundry.canvas.containers.PreciseText {
        const label = new foundry.canvas.containers.PreciseText('', CONFIG.canvasTextStyle);
        label.anchor.set(0.5);
        return label;
    }

    #refreshLabel(label: foundry.canvas.containers.PreciseText, text: string, position: { x: number, y: number }, scale: number) {
        label.text = text;
        label.position.set(position.x, position.y);
        label.scale.set(scale);
    }
}