import { SR5Item } from './item/SR5Item';

export default class Template extends MeasuredTemplate {
    x: number;
    y: number;
    item?: SR5Item;
    onComplete?: () => void;

    static fromItem(item: SR5Item, onComplete?: () => void): Template | undefined {
        if (!canvas.scene) return;
        
        // Cast string to const for type const string union to match.
        const templateShape = 'circle' as const;

        const templateData = {
            t: templateShape,
            user: game.user?.id,
            direction: 0,
            x: 0,
            y: 0,
            fillColor: game.user?.color,
        };

        // Either use blast data or default values.
        const blast = item.getBlastData();
        // Not all items return blast data.
        templateData['distance'] = blast?.radius || 1; // Adhere to DataModel validation.
        templateData['dropoff'] = blast?.dropoff || 0;

        const document = new MeasuredTemplateDocument(templateData, {parent: canvas.scene});
        // @ts-ignore
        const template = new Template(document);
        template.item = item;
        template.onComplete = onComplete;
        return template;
    }

    async drawPreview() {
        if (!canvas.ready || !this.layer.preview) return;

        const initialLayer = canvas.activeLayer;
        if (!initialLayer) return;

        await this.draw();
        this.layer.activate();
        this.layer.preview.addChild(this);
        this.activatePreviewListeners(initialLayer);
    }

    activatePreviewListeners(initialLayer: CanvasLayer) {
        if (!canvas.ready || !canvas.stage || !canvas.app) return;

        const handlers = {};
        let moveTime = 0;

        // Update placement (mouse-move)
        handlers['mm'] = (event) => {
            event.stopPropagation();
            if (!canvas.grid) return;
            let now = Date.now(); // Apply a 20ms throttle
            if (now - moveTime <= 20) return;
            const mousePos = event.data.getLocalPosition(this.layer);
            const snapped = canvas.grid.getSnappedPosition(mousePos.x, mousePos.y, 2);
            //@ts-ignore // TODO: foundry-vtt-types v10
            this.document.updateSource({x: snapped.x, y: snapped.y})
            // this.data.x = snapped.x;
            // this.data.y = snapped.y;
            this.refresh();
            moveTime = now;
        };

        // Cancel the workflow (right-click)
        handlers['rc'] = () => {
            if (!canvas.ready || !this.layer.preview || !canvas.stage || !canvas.app) return;

            this.layer.preview.removeChildren();
            canvas.stage.off('mousemove', handlers['mm']);
            canvas.stage.off('mousedown', handlers['lc']);
            canvas.app.view.oncontextmenu = null;
            canvas.app.view.onwheel = null;
            initialLayer.activate();

            if (this.onComplete) this.onComplete();
        };

        // Confirm the workflow (left-click)
        handlers['lc'] = (event) => {
            // Trigger cancel to remove event listeners.
            handlers['rc'](event);
            
            if (!canvas.grid) return;

            // Transform mouse position into grid position
            const gridPos = canvas.grid.getSnappedPosition(this.x, this.y, 2);
            
            // Prepare measued template data.
            const templateData = this.document.toObject();
            templateData.x = gridPos.x;
            templateData.y = gridPos.y;

            // Create new document from that.
            canvas.scene?.createEmbeddedDocuments('MeasuredTemplate', [templateData]);
        };

        // Rotate the template by 3 degree increments (mouse-wheel)
        handlers['mw'] = (event) => {
            if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
            event.stopPropagation();
            if (!canvas.grid) return;

            let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
            let snap = event.shiftKey ? delta : 5;

            //@ts-ignore // TODO: foundry-vtt-types v10
            const direction = this.document.direction + snap * Math.sign(event.deltaY);
            //@ts-ignore // TODO: foundry-vtt-types v10
            this.document.updateSource({direction})
            this.refresh();
        };

        // Activate listeners
        canvas.stage.on('mousemove', handlers['mm']);
        canvas.stage.on('mousedown', handlers['lc']);
        canvas.app.view.oncontextmenu = handlers['rc'];
        canvas.app.view.onwheel = handlers['mw'];
    }
}
