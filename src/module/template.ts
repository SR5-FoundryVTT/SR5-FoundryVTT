import { SR5Item } from './item/SR5Item';


export default // @ts-ignore
class Template extends MeasuredTemplate {
    x: number;
    y: number;
    item?: SR5Item;
    onComplete?: () => void;

    static fromItem(item: SR5Item, onComplete?: () => void): Template | undefined {
        const templateShape = 'circle';

        const templateData = {
            t: templateShape,
            user: game.user?.id,
            direction: 0,
            x: 0,
            y: 0,
            // @ts-ignore
            fillColor: game.user?.color,
        };
        const blast = item.getBlastData();
        templateData['distance'] = blast?.radius;
        templateData['dropoff'] = blast?.dropoff;

        // @ts-ignore
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
            const center = event.data.getLocalPosition(this.layer);
            const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
            this.data.x = snapped.x;
            this.data.y = snapped.y;
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
            handlers['rc'](event);
            if (!canvas.grid) return;

            // Confirm final snapped position
            const destination = canvas.grid.getSnappedPosition(this.x, this.y, 2);
            this.data.update({x: destination.x, y: destination.y});

            // Create the template
            // @ts-ignore
            canvas.scene?.createEmbeddedDocuments('MeasuredTemplate', [this.data]);
        };

        // Rotate the template by 3 degree increments (mouse-wheel)
        handlers['mw'] = (event) => {
            if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
            event.stopPropagation();
            if (!canvas.grid) return;

            let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
            let snap = event.shiftKey ? delta : 5;
            this.data.direction += snap * Math.sign(event.deltaY);
            // @ts-ignore
            this.refresh();
        };

        // Activate listeners
        canvas.stage.on('mousemove', handlers['mm']);
        canvas.stage.on('mousedown', handlers['lc']);
        canvas.app.view.oncontextmenu = handlers['rc'];
        canvas.app.view.onwheel = handlers['mw'];
    }
}
