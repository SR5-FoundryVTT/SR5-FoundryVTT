import { SR5Item } from '../item/SR5Item';

const CARDINAL_DIRECTIONS = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
] as const;
const BLAST_FILL_COLORS = [0xcc3333, 0xd9b300, 0x33aa33] as const;
const BLAST_FILL_ALPHA = 0.2;
const DEFAULT_BORDER_COLOR = 0x000000;

export interface BlastTemplateData {
    radius: number
    dropoff: number
    damageValue?: number
    damageType?: string
}

export type BlastCircleLayout = {
    distance: number
    radius: number
};

const getDamageCode = (damageType?: string) => {
    const key = {
        physical: 'SR5.DmgCodePhysical',
        stun: 'SR5.DmgCodeStun',
        matrix: 'SR5.DmgCodeMatrix',
    }[damageType ?? ''];
    if (key) return game.i18n.localize(key);
    return damageType?.charAt(0).toUpperCase() ?? '';
};

export const getBlastCircleLayout = (
    blast: BlastTemplateData,
    distancePixels: number,
): BlastCircleLayout[] => {
    const dropoff = Math.abs(blast.dropoff);
    const damageValue = blast.damageValue ?? 0;
    if (dropoff === 0 || damageValue <= 0 || blast.radius <= 0) return [];

    const effectiveRadius = Math.min(blast.radius, Math.floor(damageValue / dropoff));
    return Array.from({ length: effectiveRadius }, (_, index) => {
        const distance = index + 1;
        const radius = distance * distancePixels;
        return {
            distance,
            radius,
        };
    });
};

export const getBlastDamageAtDistance = (blast: BlastTemplateData, distance: number): number | undefined => {
    const dropoff = Math.abs(blast.dropoff);
    const damageValue = blast.damageValue ?? 0;
    if (dropoff === 0 || damageValue <= 0 || distance < 0 || distance > blast.radius) return undefined;

    const damage = damageValue - (Math.floor(distance) * dropoff);
    return damage > 0 ? damage : undefined;
};

/**
 * This class has been mostly copied from the FoundryVTT Dnd5e system.
 * 
 * As to that systems license agreement, here is the license agreement for parts this file.
 * 
 * Copyright 2021 Andrew Clayton

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Place a template based on item blast data with
 * - preview on mouse movement
 * - confirm and place template preview on left click
 * - cancel template preview on right click
 * 
 */
export default class BlastTemplate extends foundry.canvas.placeables.MeasuredTemplate {
    // The source item of this template.
    // NOTE: This is never really used.
    item?: SR5Item;
    // Will be called once placement is confirmed or canceled.
    onComplete?: () => void;

    /**
     * Track the timestamp when the last mouse move event was captured.
     */
    #moveTime = 0;

    /**
     * Track the bound event handlers so they can be properly canceled later.
     */
    #events: any;

    #persistOnConfirm = true;

    #onPositionSelected?: (position: { x: number, y: number }, token?: TokenDocument) => void;

    #positionSelected = false;

    #blastData?: BlastTemplateData;

    #blastOverlay?: PIXI.Container;

    #blastGraphics?: PIXI.Graphics;

    #blastTokenDamageLabels: foundry.canvas.containers.PreciseText[] = [];

    /**
     * Create a template preview based on given items blast data.
     * 
     * This is factory method to create a new template instance.
     * 
     * @param item Item containing any blast data.
     * @param onComplete Handler to call when template is placed.
     * @returns Template instance. Not drawn on scene.
     */
    static fromItem(item: SR5Item, onComplete?: () => void, blast = item.getBlastData()): BlastTemplate | undefined {
        if (!canvas.scene) return undefined;

        // Either use blast data or default values.
        // Cast string to const for type const string union to match.
        const templateShape = 'circle' as const;

        const templateData = {
            t: templateShape,
            user: game.user?.id,
            direction: 0,
            x: 0,
            y: 0,
            // DataModel says it wants a string but breaks if given toRGBA(1)
            // while happily accepting a Color instance...
            fillColor: game.user?.color,
            distance: blast?.radius || 1, // Adhere to DataModel validation.
            dropoff: blast?.dropoff || 0
        };

        // Use overwritten MeasuredTemplate class to create a new instance.
        const cls = CONFIG.MeasuredTemplate.documentClass;
        //@ts-expect-error please help
        const template = new cls(templateData, { parent: canvas.scene });
        const object = new this(template);

        // Connect system information to template.
        object.item = item;
        object.onComplete = onComplete;
        object.#blastData = blast;

        return object;
    }

    /**
     * Draw a preview of this Template instance on the currently active scene.
     */
    async drawPreview(options: {
        persistOnConfirm?: boolean
        onPositionSelected?: (position: { x: number, y: number }, token?: TokenDocument) => void
    } = {}) {
        if (!canvas.ready || !canvas.templates) return;

        this.#persistOnConfirm = options.persistOnConfirm ?? true;
        this.#onPositionSelected = options.onPositionSelected;
        this.#positionSelected = false;

        const layer = canvas.templates;
        await this.draw();

        const previewGroup = new PIXI.Container();
        layer.addChild(previewGroup);
        previewGroup.addChild(this);
        this.#createBlastOverlay(previewGroup);
        this.#refreshBlastOverlay();

        return this.activatePreviewListeners();
    }

    async cancelPreview() {
        await this._finishPlacement();
    }

    async place() {
        if (!canvas.ready) return;

        await this._finishPlacement();
        const destination = canvas.grid!.getSnappedPoint({x: this.document.x, y: this.document.y}, {mode: CONST.GRID_SNAPPING_MODES.CENTER});
        this.document.updateSource(destination);
        await canvas.scene!.createEmbeddedDocuments('MeasuredTemplate', [this.document.toObject()]);
    }

    async activatePreviewListeners(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!canvas.ready) return;

            // Store listeners
            this.#events = {
                move: this._onMovePlacement.bind(this),
                confirm: this._onConfirmPlacement.bind(this),
                cancel: this._onCancelPlacement.bind(this),
                rotate: this._onRotatePlacement.bind(this),
                resolve,
                reject
            };

            // Use canvas.view to attach PiXi events.
            canvas.stage?.on("mousemove", this.#events.move);
            canvas.stage?.on("mousedown", this.#events.confirm);
            canvas.app!.view.oncontextmenu = this.#events.cancel;
            canvas.app!.view.onwheel = this.#events.rotate;
        });
    }
    /**
     * Shared code for when template placement ends by being confirmed or canceled.
    * @param event  Triggering event that ended the placement.
    */
    async _finishPlacement() {
        if (!canvas.ready) return;

        this.#blastOverlay?.destroy({ children: true });
        this.#blastOverlay = undefined;

        // Remove this template from the preview
        this.destroy();

        // Detach event listeners from the canvas DOM element
        canvas.stage!.off("mousemove", this.#events.move);
        canvas.stage!.off("mousedown", this.#events.confirm);
        canvas.app!.view.oncontextmenu = null;
        canvas.app!.view.onwheel = null;

        // Run the completion callback
        this.onComplete?.();
    }

    #createBlastOverlay(previewGroup: PIXI.Container) {
        if (!this.#blastData || this.#blastData.dropoff >= 0 || !this.#blastData.damageValue) return;

        this.#blastOverlay = previewGroup.addChild(new PIXI.Container());
        this.#blastGraphics = this.#blastOverlay.addChild(new PIXI.Graphics());
    }

    #refreshBlastOverlay() {
        if (!this.#blastData || !this.#blastGraphics) return;

        const scale = canvas.dimensions!.uiScale;
        const layout = getBlastCircleLayout(this.#blastData, canvas.dimensions!.distancePixels);
        const graphics = this.#blastGraphics.clear();
        this.#blastOverlay!.position.set(this.position.x, this.position.y);

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
            this.#blastOverlay?.removeChild(label);
            label.destroy();
        }
        this.#blastTokenDamageLabels = [];

        if (!this.#blastData || this.#blastData.dropoff >= 0) return;

        for (const token of canvas.tokens?.placeables ?? []) {
            if (!token.visible || !token.renderable) continue;

            const distance = canvas.grid!.measurePath([
                { x: this.document.x, y: this.document.y },
                token.center,
            ], {}).distance;
            const damage = getBlastDamageAtDistance(this.#blastData, distance);
            if (damage === undefined) continue;

            const label = this.#blastOverlay!.addChild(this.#createBlastLabel());
            this.#refreshBlastLabel(label, `${damage}${getDamageCode(this.#blastData.damageType)}`, {
                x: token.center.x - this.position.x + (token.w / 2) + (8 / scale),
                y: token.center.y - this.position.y,
            }, scale);
            this.#blastTokenDamageLabels.push(label);
        }
    }

    #createBlastLabel() {
        const label = new foundry.canvas.containers.PreciseText('', CONFIG.canvasTextStyle);
        label.anchor.set(0.5);
        return label;
    }

    #refreshBlastLabel(label: foundry.canvas.containers.PreciseText, text: string, position: { x: number, y: number }, scale: number) {
        label.text = text;
        label.position.set(position.x, position.y);
        label.scale.set(scale);
    }

    /* -------------------------------------------- */

    /**
     * Move the template preview when the mouse moves.
     * @param {Event} event  Triggering mouse event.
     */
    _onMovePlacement(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();
        if (!this.#persistOnConfirm && this.#positionSelected) return;
        const now = Date.now(); // Apply a 20ms throttle
        if (now - this.#moveTime <= 20) return;
        const center = event.data.getLocalPosition(this.layer);
        const snapped = canvas.grid!.getSnappedPoint({x: center.x, y: center.y}, {mode: CONST.GRID_SNAPPING_MODES.CENTER});
        this.document.updateSource({ x: snapped.x, y: snapped.y });
        this.refresh();
        this.#refreshBlastOverlay();
        this.#moveTime = now;
    }

    /* -------------------------------------------- */

    /**
     * Rotate the template preview by 3˚ increments when the mouse wheel is rotated.
     * @param {Event} event  Triggering mouse event.
     */
    _onRotatePlacement(event: WheelEvent) {
        if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
        event.stopPropagation();
        const delta = canvas.grid!.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
        const snap = event.shiftKey ? delta : 5;
        const update = { direction: this.document.direction + (snap * Math.sign(event.deltaY)) };
        this.document.updateSource(update);
        this.refresh();
    }

    /* -------------------------------------------- */

    /**
     * Confirm placement when the left mouse button is clicked.
     * @param {Event} event  Triggering mouse event.
     */
    async _onConfirmPlacement(event: PIXI.FederatedPointerEvent) {
        if (event.button !== 0) return;

        const destination = canvas.grid!.getSnappedPoint({x: this.document.x, y: this.document.y}, {mode: CONST.GRID_SNAPPING_MODES.CENTER});
        this.document.updateSource(destination);
        const resolution = canvas.app?.renderer?.resolution ?? 1;
        const point = {
            x: event.global.x * resolution,
            y: event.global.y * resolution,
        };
        const token = event.target instanceof foundry.canvas.placeables.Token ?
            event.target.document :
            canvas.tokens?.placeables.find(candidate => {
                if (!candidate.visible || !candidate.renderable) return false;
                return candidate.getBounds().contains(point.x, point.y);
            })?.document;

        if (!this.#persistOnConfirm) {
            this.#positionSelected = true;
            if (token?.id)
                canvas.tokens?.setTargets([token.id], {mode: event.shiftKey ? 'acquire' : 'replace'});
            this.#onPositionSelected?.(destination, token);
            return;
        }

        await this._finishPlacement();
        this.#events.resolve(canvas.scene!.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]));
    }

    /* -------------------------------------------- */

    /**
     * Cancel placement when the right mouse button is clicked.
     * @param {Event} event  Triggering mouse event.
     */
    async _onCancelPlacement(event: PointerEvent) {
        await this._finishPlacement();
        this.#events.reject();
    }
}
