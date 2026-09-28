import { FLAGS, SYSTEM_NAME } from '../constants';
import { calculateCompanionCoords, getSwarmSubRatio, SwarmTileHooks } from './SwarmTileHooks';

export class SR5Token extends foundry.canvas.placeables.Token {
    override _onUpdate(...args: Parameters<foundry.canvas.placeables.Token['_onUpdate']>) {
        super._onUpdate(...args);

        const [changed] = args;
        if (foundry.utils.hasProperty(changed, `flags.${SYSTEM_NAME}.${FLAGS.TokenMovementPhaseMarkers}`)) {
            // The ruler reads these markers while displaying the token's movement history.
            this.renderFlags.set({ refreshRuler: true });
        }
    }

    override _drawBar(number: number, bar: PIXI.Graphics, data: NonNullable<TokenDocument.GetBarAttributeReturn>) {
        const tokenHealthBars = game.settings.get(SYSTEM_NAME, FLAGS.TokenHealthBars);
        // FoundryVTT draws resource bars as full/good when the value is the
        // same as the max and empty/bad at 0 (colored along a gradient).
        // Shadowrun condition trackers count up from 0 to the maximum.
        // We flip the values from Shadowrun format to FoundryVTT format here
        // for drawing.
        if (tokenHealthBars && data.type === 'bar' && data.attribute.startsWith('track')) {
            data.value = data.max - data.value;
        }
        return super._drawBar(number, bar, data);
    }

    override animate(to: any, options?: any) {
        return super.animate(to, options);
    }

    /**
     * Updates swarm companion tile positions when the leader token moves.
     */
    override _onAnimationUpdate(changed: any, context: any) {
        super._onAnimationUpdate(changed, context);
        this._updateSwarmCompanionPositions();
    }

    _swarmDragSprites: any[] = [];

    private _getCompanionTiles(scene: Scene, primaryId: string, primaryActorUuid?: string | null): TileDocument[] {
        return scene.tiles.filter(t => {
            const isTile = Boolean(t.getFlag('shadowrun5e', 'isSwarmTile'));
            if (!isTile) return false;
            const pId = t.getFlag('shadowrun5e', 'swarmPrimaryTokenId');
            const aUuid = t.getFlag('shadowrun5e', 'swarmActorUuid');
            return pId === primaryId || (Boolean(primaryActorUuid) && aUuid === primaryActorUuid);
        });
    }

    override _onDragLeftStart(event: any) {
        super._onDragLeftStart(event);

        this._destroySwarmDragSprites();

        const actor = this.actor;
        if (!actor || !actor.isType('vehicle')) return;

        const isSwarm = Boolean(actor.system.swarm.active);
        if (!isSwarm) return;

        const targetSwarmCount = Math.max(2, actor.system.swarm.count ?? 2);
        const desiredCompanions = targetSwarmCount - 1;
        if (desiredCompanions <= 0) return;

        const primaryId = this.document.id;
        if (!primaryId) return;
        const primaryActorUuid = actor.uuid;
        const scene = this.document.parent as Scene | null;
        if (!scene || !canvas.ready) return;

        const companionTiles = this._getCompanionTiles(scene, primaryId, primaryActorUuid);

        let subRatio = 1.0;
        if (targetSwarmCount === 2) subRatio = 0.38;
        else if (targetSwarmCount === 3) subRatio = 0.33;
        else if (targetSwarmCount === 4) subRatio = 0.30;
        else if (targetSwarmCount === 5) subRatio = 0.28;
        else if (targetSwarmCount <= 7) subRatio = 0.26;
        else if (targetSwarmCount <= 10) subRatio = 0.24;
        else subRatio = Math.max(0.18, 0.24 - 0.008 * targetSwarmCount);

        const gridSize = (canvas.grid as any)?.size || (scene as any)?.grid?.size || 100;
        const tokenW = this.document.width || 1;
        const tokenH = this.document.height || 1;
        const totalW = tokenW * gridSize;
        const totalH = tokenH * gridSize;

        const startCenterX = this.x + (totalW / 2);
        const startCenterY = this.y + (totalH / 2);
        const startCoords = calculateCompanionCoords({
            centerX: startCenterX,
            centerY: startCenterY,
            totalW,
            totalH,
            subRatio,
            desiredCompanions
        });

        const companionImage = this.document.texture?.src || actor.img || '';

        for (let i = 0; i < companionTiles.length && i < desiredCompanions; i++) {
            const tileDoc = companionTiles[i];
            const coord = startCoords[i];

            try {
                const spriteSrc = tileDoc.texture?.src || companionImage;
                const sprite = PIXI.Sprite.from(spriteSrc);
                sprite.anchor.set(0.5, 0.5);
                sprite.width = coord.width;
                sprite.height = coord.height;
                sprite.x = coord.x;
                sprite.y = coord.y;
                (sprite as any)._startCoord = { x: coord.x, y: coord.y };
                sprite.name = 'swarmCompanionDragPreview';
                sprite.alpha = 0.75;

                if (canvas.controls) {
                    canvas.controls.addChild(sprite);
                }

                this._swarmDragSprites.push(sprite);
            } catch (e) {}
        }
    }

    _getSnappedTopLeft(point: { x: number; y: number }): { x: number; y: number } {
        if (!canvas.ready || !canvas.grid) return point;
        const grid = canvas.grid as any;

        if (typeof grid.getTopLeft === 'function') {
            try {
                const tl = grid.getTopLeft(point);
                if (tl && typeof tl.x === 'number' && typeof tl.y === 'number') {
                    return { x: tl.x, y: tl.y };
                }
            } catch (e) {}
            try {
                const tl = grid.getTopLeft(point.x, point.y);
                if (tl && typeof tl.x === 'number' && typeof tl.y === 'number') {
                    return { x: tl.x, y: tl.y };
                }
            } catch (e) {}
        }

        if (typeof grid.getSnappedPoint === 'function') {
            try {
                const mode = (CONST as any)?.GRID_SNAPPING_MODES?.TOP_LEFT ?? 16;
                const snapped = grid.getSnappedPoint(point, { mode });
                if (snapped && typeof snapped.x === 'number' && typeof snapped.y === 'number') {
                    return { x: snapped.x, y: snapped.y };
                }
            } catch (e) {
                console.warn('Shadowrun5e | SR5Token: Failed to get snapped point', e);
            }
        }

        const size = grid.size || 100;
        return {
            x: Math.round(point.x / size) * size,
            y: Math.round(point.y / size) * size
        };
    }

    override _onDragLeftMove(event: any) {
        super._onDragLeftMove(event);

        const preview = (this as any)._preview || (this as any).preview;
        let snappedDest: { x: number; y: number } | null = null;

        if (preview && typeof preview.x === 'number' && typeof preview.y === 'number' && (preview.x !== this.x || preview.y !== this.y)) {
            snappedDest = { x: preview.x, y: preview.y };
        } else {
            const interactionData = event?.interactionData;
            const origin = interactionData?.origin;
            const destination = interactionData?.destination;

            if (destination) {
                let targetX = destination.x;
                let targetY = destination.y;

                if (origin) {
                    targetX = this.x + (destination.x - origin.x);
                    targetY = this.y + (destination.y - origin.y);
                }

                snappedDest = this._getSnappedTopLeft({ x: targetX, y: targetY });
            }
        }

        if (snappedDest && Array.isArray(this._swarmDragSprites) && this._swarmDragSprites.length > 0) {
            const dx = snappedDest.x - this.x;
            const dy = snappedDest.y - this.y;

            for (const sprite of this._swarmDragSprites) {
                const start = (sprite as any)._startCoord;
                if (start) {
                    sprite.x = start.x + dx;
                    sprite.y = start.y + dy;
                }
            }
        }
    }

    override _onDragLeftDrop(event: any) {
        this._destroySwarmDragSprites();
        this._updateSwarmCompanionPositions();
        return super._onDragLeftDrop(event);
    }

    override _onDragLeftCancel(event: any) {
        this._destroySwarmDragSprites();
        this._updateSwarmCompanionPositions();
        return super._onDragLeftCancel(event);
    }

    _destroySwarmDragSprites() {
        if (Array.isArray(this._swarmDragSprites)) {
            for (const sprite of this._swarmDragSprites) {
                try {
                    if (sprite.parent) sprite.parent.removeChild(sprite);
                    sprite.destroy();
                } catch (e) {
                    console.warn('Shadowrun5e | SR5Token: Failed to destroy swarm drag sprite', e);
                }
            }
        }
        this._swarmDragSprites = [];
    }

    _restoreSwarmTileAlpha() {
        const actor = this.actor;
        if (!actor || !actor.isType('vehicle')) return;

        const primaryId = this.document.id;
        if (!primaryId) return;
        const primaryActorUuid = actor.uuid;
        const scene = this.document.parent as Scene | null;
        if (!scene || !canvas.ready) return;

        const companionTiles = this._getCompanionTiles(scene, primaryId, primaryActorUuid);

        for (const tileDoc of companionTiles) {
            const tileObject = (tileDoc as any).object || (canvas.tiles as any)?.get?.(tileDoc.id);
            if (tileObject) {
                tileObject.alpha = 1.0;
            }
        }
    }

    _updateSwarmDragPosition(event?: any) {
        const preview = (this as any)._preview || (this as any).preview || this;
        if (!preview) return;

        const actor = this.actor;
        if (!actor || !actor.isType('vehicle')) return;

        const isSwarm = Boolean(actor.system.swarm.active);
        if (!isSwarm) return;

        const targetSwarmCount = Math.max(2, actor.system.swarm.count ?? 2);
        const desiredCompanions = targetSwarmCount - 1;
        if (desiredCompanions <= 0) return;

        const primaryId = this.document.id;
        if (!primaryId) return;
        const primaryActorUuid = actor.uuid;
        const scene = this.document.parent as Scene | null;
        if (!scene || !canvas.ready) return;

        const companionTiles = this._getCompanionTiles(scene, primaryId, primaryActorUuid);

        if (companionTiles.length === 0) return;

        const subRatio = getSwarmSubRatio(targetSwarmCount);

        const gridSize = (canvas.grid as any)?.size || (scene as any)?.grid?.size || 100;
        const tokenW = this.document.width || 1;
        const tokenH = this.document.height || 1;
        const totalW = tokenW * gridSize;
        const totalH = tokenH * gridSize;

        const ruler = (canvas.tokens as any)?.ruler || (this as any).ruler;
        const pendingWaypoints = ruler?.pendingWaypoints;

        let previewX: number = this.x;
        let previewY: number = this.y;

        const eventDest = event?.interactionData?.destination;
        if (pendingWaypoints && pendingWaypoints.length > 0) {
            const lastWaypoint = pendingWaypoints[pendingWaypoints.length - 1];
            if (lastWaypoint) {
                previewX = typeof lastWaypoint.x === 'number' ? lastWaypoint.x : (lastWaypoint.center ? lastWaypoint.center.x - (totalW / 2) : previewX);
                previewY = typeof lastWaypoint.y === 'number' ? lastWaypoint.y : (lastWaypoint.center ? lastWaypoint.center.y - (totalH / 2) : previewY);
            }
        } else if (preview && typeof preview.x === 'number' && typeof preview.y === 'number' && preview !== this) {
            previewX = preview.x;
            previewY = preview.y;
        } else if (typeof eventDest?.x === 'number' && typeof eventDest?.y === 'number') {
            const eventOrigin = event?.interactionData?.origin;
            let targetX = eventDest.x;
            let targetY = eventDest.y;
            if (eventOrigin) {
                targetX = this.x + (eventDest.x - eventOrigin.x);
                targetY = this.y + (eventDest.y - eventOrigin.y);
            }
            const snapped = this._getSnappedTopLeft({ x: targetX, y: targetY });
            previewX = snapped.x;
            previewY = snapped.y;
        }

        const centerX = previewX + (totalW / 2);
        const centerY = previewY + (totalH / 2);

        const coords = calculateCompanionCoords({
            centerX,
            centerY,
            totalW,
            totalH,
            subRatio,
            desiredCompanions
        });

        for (let i = 0; i < companionTiles.length && i < desiredCompanions; i++) {
            const tileDoc = companionTiles[i];
            const tileObject = (tileDoc as any).object || (canvas.tiles as any)?.get?.(tileDoc.id);
            if (tileObject) {
                tileObject.x = coords[i].x;
                tileObject.y = coords[i].y;
                if (typeof tileObject._refreshPosition === 'function') {
                    tileObject._refreshPosition();
                } else if (typeof tileObject.refresh === 'function') {
                    tileObject.refresh();
                }
            }
        }
    }

    _updateSwarmCompanionPositions() {
        const actor = this.actor;
        if (!actor || !actor.isType('vehicle')) return;

        const isSwarm = Boolean(actor.system.swarm.active);
        if (!isSwarm) return;

        const targetSwarmCount = Math.max(2, actor.system.swarm.count ?? 2);
        const desiredCompanions = targetSwarmCount - 1;
        if (desiredCompanions <= 0) return;

        const primaryId = this.document.id;
        if (!primaryId) return;
        const primaryActorUuid = actor.uuid;
        const scene = this.document.parent as Scene | null;
        if (!scene || !canvas.ready) return;

        const companionTiles = this._getCompanionTiles(scene, primaryId, primaryActorUuid);

        if (companionTiles.length === 0) return;

        const subRatio = getSwarmSubRatio(targetSwarmCount);

        const gridSize = (canvas.grid as any)?.size || (scene as any)?.grid?.size || 100;
        const tokenW = this.document.width || 1;
        const tokenH = this.document.height || 1;
        const totalW = tokenW * gridSize;
        const totalH = tokenH * gridSize;

        const currentX = typeof this.document?.x === 'number' ? this.document.x : this.x;
        const currentY = typeof this.document?.y === 'number' ? this.document.y : this.y;

        const centerX = currentX + (totalW / 2);
        const centerY = currentY + (totalH / 2);

        const coords = calculateCompanionCoords({
            centerX,
            centerY,
            totalW,
            totalH,
            subRatio,
            desiredCompanions
        });

        for (let i = 0; i < companionTiles.length && i < desiredCompanions; i++) {
            const tileDoc = companionTiles[i];
            const tileObject = tileDoc.object || (tileDoc.id ? canvas.tiles?.get(tileDoc.id) : undefined);
            if (tileObject) {
                const targetX = coords[i].x;
                const targetY = coords[i].y;

                tileObject.x = targetX;
                tileObject.y = targetY;

                if (tileObject.mesh && typeof tileObject.mesh.position?.set === 'function') {
                    tileObject.mesh.position.set(targetX, targetY);
                }
                if (tileObject.bg && typeof tileObject.bg.position?.set === 'function') {
                    tileObject.bg.position.set(targetX, targetY);
                }
                if (tileObject.position && typeof tileObject.position.set === 'function') {
                    tileObject.position.set(targetX, targetY);
                }
                if (typeof tileObject.refresh === 'function') {
                    try {
                        tileObject.refresh();
                    } catch (e) {
                        console.warn('Shadowrun5e | SR5Token: Failed to refresh tile position', e);
                    }
                }
            }
        }
    }

}



