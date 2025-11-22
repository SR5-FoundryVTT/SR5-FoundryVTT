import { SR5Item } from './item/SR5Item';

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
export default class Template extends foundry.canvas.placeables.MeasuredTemplate {
    // The source item of this template.
    // NOTE: This is never really used.
    item?: SR5Item;
    // Will be called once placement is confirmed or canceled.
    onComplete?: () => void;

    /**
     * Track the timestamp when the last mouse move event was captured.
     */
    #moveTime = 0;

    /* -------------------------------------------- */

    /**
     * The initially active CanvasLayer to re-activate after the workflow is complete.
     */
    #initialLayer: TemplateLayer | undefined;

    /* -------------------------------------------- */

    /**
     * Track the bound event handlers so they can be properly canceled later.
     */
    #events: any;

    /**
     * Create a template preview based on given items blast data.
     * 
     * This is factory method to create a new template instance.
     * 
     * @param item Item containing any blast data.
     * @param onComplete Handler to call when template is placed.
     * @returns Template instance. Not drawn on scene.
     */
    static fromItem(item: SR5Item, onComplete?: () => void): Template | undefined {
        if (!canvas.scene) return undefined;

        // Either use blast data or default values.
        const blast = item.getBlastData();

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

        return object;
    }

    /**
     * Draw a preview of this Template instance on the currently active scene.
     */
    async drawPreview() {
        if (!canvas.ready || !canvas.templates) return;

        const layer = canvas.templates;
        await this.draw();

        const previewGroup = new PIXI.Container();
        layer.addChild(previewGroup);
        previewGroup.addChild(this);

        return this.activatePreviewListeners(layer);
    }

    async activatePreviewListeners(initialLayer: TemplateLayer): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!canvas.ready) return;

            this.#initialLayer = initialLayer;

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
    async _finishPlacement(event: PointerEvent) {
        if (!canvas.ready) return;

        // Remove this template from the preview
        this.destroy();

        // Detach event listeners from the canvas DOM element
        canvas.stage!.off("mousemove", this.#events.move);
        canvas.stage!.off("mousedown", this.#events.confirm);
        canvas.app!.view.oncontextmenu = null;
        canvas.app!.view.onwheel = null;

        if (this.#initialLayer) {
            this.#initialLayer.activate();
        }

        // Run the completion callback
        this.onComplete?.();
    }

    /* -------------------------------------------- */

    /**
     * Move the template preview when the mouse moves.
     * @param {Event} event  Triggering mouse event.
     */
    _onMovePlacement(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();
        const now = Date.now(); // Apply a 20ms throttle
        if (now - this.#moveTime <= 20) return;
        const center = event.data.getLocalPosition(this.layer);
        const snapped = canvas.grid!.getSnappedPoint({x: center.x, y: center.y}, {mode: CONST.GRID_SNAPPING_MODES.CENTER});
        this.document.updateSource({ x: snapped.x, y: snapped.y });
        this.refresh();
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
    async _onConfirmPlacement(event: PointerEvent) {
        await this._finishPlacement(event);
        const destination = canvas.grid!.getSnappedPoint({x: this.document.x, y: this.document.y}, {mode: CONST.GRID_SNAPPING_MODES.CENTER});
        this.document.updateSource(destination);
        this.#events.resolve(canvas.scene!.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]));
    }

    /* -------------------------------------------- */

    /**
     * Cancel placement when the right mouse button is clicked.
     * @param {Event} event  Triggering mouse event.
     */
    async _onCancelPlacement(event: PointerEvent) {
        await this._finishPlacement(event);
        this.#events.reject();
    }
}
