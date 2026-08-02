import { TestDialogLike, TestDialogListener } from '../../apps/dialogs/TestDialog';
import { FireModeType } from '../../types/flags/ItemFlags';

interface SuppressiveFireTemplateFlowHost {
    actor: {
        getToken(): TokenDocument | null
    } | undefined
    data: {
        fireMode: FireModeType
    }
}

const TEMPLATE_OUTER_ARC = 10;
const FILL_COLOR = 0xd9b300;
const FILL_ALPHA = 0.2;
const BORDER_COLOR = 0x000000;

type Point = { x: number, y: number };

/** Handles the placement of a suppressive-fire cone with a fixed outer arc. */
export class SuppressiveFireTemplateFlow {
    #preview?: PIXI.Graphics;
    #base!: Point;
    #direction = 0;
    #distance = 0;
    #angle = 0;
    #events?: {
        move: (event: PIXI.FederatedPointerEvent) => void
        confirm: (event: PIXI.FederatedPointerEvent) => void
        cancel: (event: MouseEvent) => void
    };

    constructor(private readonly test: SuppressiveFireTemplateFlowHost) { }

    get canPlace(): boolean {
        return this.test.data.fireMode.suppression === true;
    }

    dialogListeners(): TestDialogListener[] {
        return [{
            query: '#show-suppressive-fire-template',
            on: 'click',
            callback: this.showPreview.bind(this)
        }];
    }

    showPreview(event: JQuery.Event, _dialog: TestDialogLike) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.canPlace) return;
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
        if (!gridSize) return;

        this.#base = {
            x: token.x + token.width * gridSize / 2,
            y: token.y + token.height * gridSize / 2,
        };
        this.#direction = 0;
        this.#distance = 0;
        this.#angle = 0;
        this.#preview = canvas.templates.addChild(new PIXI.Graphics());
        this.#bindPreviewListeners();
    }

    cancelPreview() {
        this.#unbindPreviewListeners();
        this.#preview?.destroy();
        this.#preview = undefined;
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
            move: this.#onMove.bind(this),
            confirm: this.#onConfirm.bind(this),
            cancel: this.#onCancel.bind(this),
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

    #onMove(event: PIXI.FederatedPointerEvent) {
        event.stopPropagation();
        const point = event.data.getLocalPosition(canvas.templates!);
        this.#drawCone(point);
    }

    #onConfirm(event: PIXI.FederatedPointerEvent) {
        if (event.button !== 0) return;

        event.stopPropagation();
        const point = event.data.getLocalPosition(canvas.templates!);
        this.#drawCone(point);
        void this.#place();
    }

    #onCancel(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.cancelPreview();
    }

    async #place() {
        if (!this.#base) return;

        const position = this.#base;
        const direction = this.#direction;
        this.cancelPreview();

        const templateData = {
            t: 'cone' as const,
            user: game.user?.id,
            x: position.x,
            y: position.y,
            direction,
            angle: this.#angle,
            distance: this.#distance,
            fillColor: game.user?.color?.toString() ?? '#ffffff',
        };
        await canvas.scene?.createEmbeddedDocuments('MeasuredTemplate', [templateData]);
    }

    #drawCone(pointer: Point) {
        const graphics = this.#preview;
        if (!graphics) return;

        const distancePixels = Math.hypot(pointer.x - this.#base.x, pointer.y - this.#base.y);
        const radius = Math.max(distancePixels, 1);
        const distance = radius / canvas.dimensions!.distancePixels;
        const angle = Math.atan2(pointer.y - this.#base.y, pointer.x - this.#base.x);
        const coneAngle = Math.min(360, TEMPLATE_OUTER_ARC / distance * 180 / Math.PI);
        const halfAngle = coneAngle * Math.PI / 360;
        const points = [this.#base.x, this.#base.y];
        const segments = 24;

        this.#direction = angle * 180 / Math.PI;
        this.#distance = distance;
        this.#angle = coneAngle;
        for (let index = 0; index <= segments; index++) {
            const segmentAngle = angle - halfAngle + (index / segments) * halfAngle * 2;
            points.push(this.#base.x + Math.cos(segmentAngle) * radius, this.#base.y + Math.sin(segmentAngle) * radius);
        }

        graphics.clear()
            .lineStyle(2, BORDER_COLOR, 0.9)
            .beginFill(FILL_COLOR, FILL_ALPHA)
            .drawPolygon(points)
            .endFill();
    }
}