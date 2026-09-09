import { SR5Actor } from '@/module/actor/SR5Actor';
import { SYSTEM_NAME } from '@/module/constants';

let isProcessingSwarm = false;

const getSwarmTileFlags = (tile: TileDocument): { isSwarmTile: boolean; swarmPrimaryTokenId: string | undefined; swarmActorUuid: string | undefined } => {
    const getFlagFn = typeof (tile as any).getFlag === 'function' ? (tile as any).getFlag.bind(tile) : null;
    const isTile = Boolean(
        (getFlagFn ? getFlagFn(SYSTEM_NAME, 'isSwarmTile') : undefined) ??
        (getFlagFn ? getFlagFn('shadowrun5e', 'isSwarmTile') : undefined) ??
        (tile.flags as any)?.[SYSTEM_NAME]?.isSwarmTile ??
        (tile.flags as any)?.shadowrun5e?.isSwarmTile
    );
    const primaryId = (
        (getFlagFn ? getFlagFn(SYSTEM_NAME, 'swarmPrimaryTokenId') : undefined) ??
        (getFlagFn ? getFlagFn('shadowrun5e', 'swarmPrimaryTokenId') : undefined) ??
        (tile.flags as any)?.[SYSTEM_NAME]?.swarmPrimaryTokenId ??
        (tile.flags as any)?.shadowrun5e?.swarmPrimaryTokenId
    ) as string | undefined;
    const actorUuid = (
        (getFlagFn ? getFlagFn(SYSTEM_NAME, 'swarmActorUuid') : undefined) ??
        (getFlagFn ? getFlagFn('shadowrun5e', 'swarmActorUuid') : undefined) ??
        (tile.flags as any)?.[SYSTEM_NAME]?.swarmActorUuid ??
        (tile.flags as any)?.shadowrun5e?.swarmActorUuid
    ) as string | undefined;

    return {
        isSwarmTile: isTile,
        swarmPrimaryTokenId: typeof primaryId === 'string' && primaryId ? primaryId : undefined,
        swarmActorUuid: typeof actorUuid === 'string' && actorUuid ? actorUuid : undefined
    };
};

const checkWallCollision = (origin: { x: number; y: number }, target: { x: number; y: number }): { x: number; y: number } | null => {
    if (!canvas.ready || !canvas.walls) return null;

    try {
        const wallsLayer = canvas.walls as any;

        // Native Foundry v14 testCollision API on canvas.walls
        if (typeof wallsLayer.testCollision === 'function') {
            const isBlocked = Boolean(wallsLayer.testCollision(origin, target, { type: 'move', mode: 'any' }));
            if (!isBlocked) return null;

            const hit = wallsLayer.testCollision(origin, target, { type: 'move', mode: 'closest' });
            if (hit && typeof hit === 'object' && typeof hit.x === 'number' && typeof hit.y === 'number') {
                return { x: Number(hit.x), y: Number(hit.y) };
            }
            return null;
        }

        // Ray fallback for v14 geometry namespace
        const RayClass = (foundry as any)?.canvas?.geometry?.Ray || (foundry as any)?.canvas?.sources?.Ray || Ray;
        const ray = new RayClass(origin, target);

        if (typeof wallsLayer.checkCollision === 'function') {
            const isBlocked = Boolean(wallsLayer.checkCollision(ray, { type: 'move' }));
            if (!isBlocked) return null;
        }
    } catch (e) {
        console.warn('Shadowrun5e | SwarmTileHooks: checkWallCollision error', e);
    }

    return null;
};

const animateSwarmTile = (
    tileObject: any,
    fromX: number,
    fromY: number,
    targetX: number,
    targetY: number,
    delayMs: number,
    durationMs: number
) => {
    if (!tileObject) return;

    const animName = `swarmTile_${tileObject.id || Math.random()}`;

    try {
        const CanvasAnim = (foundry as any)?.canvas?.animation?.CanvasAnimation || (globalThis as any).CanvasAnimation;
        if (CanvasAnim && typeof CanvasAnim.terminateAnimation === 'function') {
            CanvasAnim.terminateAnimation(animName);
        }
    } catch (e) {}

    try {
        if (typeof fromX === 'number') tileObject.x = fromX;
        if (typeof fromY === 'number') tileObject.y = fromY;
        if (typeof tileObject._refreshPosition === 'function') {
            tileObject._refreshPosition();
        } else if (typeof tileObject.refresh === 'function') {
            tileObject.refresh();
        }
    } catch (e) {}

    const startAnim = () => {
        try {
            const CanvasAnim = (foundry as any)?.canvas?.animation?.CanvasAnimation || (globalThis as any).CanvasAnimation;
            if (CanvasAnim && typeof CanvasAnim.animate === 'function') {
                const anims: any[] = [
                    { parent: tileObject, attribute: 'x', from: fromX, to: targetX },
                    { parent: tileObject, attribute: 'y', from: fromY, to: targetY }
                ];

                CanvasAnim.animate(anims, {
                    name: animName,
                    duration: durationMs,
                    easing: 'easeOutCubic',
                    ontick: () => {
                        try {
                            if (typeof tileObject._refreshPosition === 'function') {
                                tileObject._refreshPosition();
                            } else if (typeof tileObject.refresh === 'function') {
                                tileObject.refresh();
                            }
                        } catch (e) {}
                    }
                });
            } else {
                tileObject.x = targetX;
                tileObject.y = targetY;
                if (typeof tileObject._refreshPosition === 'function') {
                    tileObject._refreshPosition();
                } else if (typeof tileObject.refresh === 'function') {
                    tileObject.refresh();
                }
            }
        } catch (e) {
            console.warn('Shadowrun5e | SwarmTileHooks: Tile animation failed', e);
        }
    };

    if (delayMs > 0) {
        setTimeout(startAnim, delayMs);
    } else {
        startAnim();
    }
};

export interface CompanionCoordOptions {
    centerX: number;
    centerY: number;
    totalW: number;
    totalH: number;
    subRatio: number;
    desiredCompanions: number;
}

export const calculateCompanionCoords = (
    opts: CompanionCoordOptions
): Array<{ x: number; y: number; width: number; height: number }> => {
    const { centerX, centerY, totalW, totalH, subRatio, desiredCompanions } = opts;
    const tileWidth = totalW * subRatio;
    const tileHeight = totalH * subRatio;

    const maxAllowedRadius = Math.min((totalW - tileWidth) / 2 - 3, (totalH - tileHeight) / 2 - 3);
    const idealSwarmRadius = Math.min(totalW, totalH) * 0.32;
    const openSpaceRadius = Math.max(8, Math.min(idealSwarmRadius, maxAllowedRadius));

    let startAngle = -Math.PI / 2;
    if (desiredCompanions === 4) {
        startAngle = -3 * Math.PI / 4;
    }

    let formationOffsetX = 0;
    let formationOffsetY = 0;
    if (desiredCompanions > 1) {
        let minX = 1, maxX = -1, minY = 1, maxY = -1;
        for (let i = 0; i < desiredCompanions; i++) {
            const a = startAngle + (2 * Math.PI * i) / desiredCompanions;
            const c = Math.cos(a);
            const s = Math.sin(a);
            if (c < minX) minX = c;
            if (c > maxX) maxX = c;
            if (s < minY) minY = s;
            if (s > maxY) maxY = s;
        }
        formationOffsetX = - openSpaceRadius * (minX + maxX) / 2;
        formationOffsetY = - openSpaceRadius * (minY + maxY) / 2;
    }

    const coords: Array<{ x: number; y: number; width: number; height: number }> = [];

    for (let i = 0; i < desiredCompanions; i++) {
        const angle = startAngle + (2 * Math.PI * i) / desiredCompanions;
        const idealCenterX = centerX + formationOffsetX + Math.cos(angle) * openSpaceRadius;
        const idealCenterY = centerY + formationOffsetY + Math.sin(angle) * openSpaceRadius;

        let targetCenterX = idealCenterX;
        let targetCenterY = idealCenterY;

        try {
            const wallHit = checkWallCollision({ x: centerX, y: centerY }, { x: idealCenterX, y: idealCenterY });
            if (wallHit) {
                const dx = wallHit.x - centerX;
                const dy = wallHit.y - centerY;
                const distToWall = Math.sqrt(dx * dx + dy * dy);
                const safeDist = Math.max(tileWidth / 2 + 2, distToWall - (tileWidth / 2 + 4));

                targetCenterX = centerX + Math.cos(angle) * safeDist;
                targetCenterY = centerY + Math.sin(angle) * safeDist;
            }
        } catch (e) {
            console.warn('Shadowrun5e | SwarmTileHooks: Wall collision check failed, using formation coords', e);
        }

        coords.push({
            x: Math.round(targetCenterX),
            y: Math.round(targetCenterY),
            width: tileWidth,
            height: tileHeight
        });
    }

    return coords;
};

export const SwarmTileHooks = {
    clearSwarmRulerPreviews: () => {
        if (!canvas.ready) return;
        const layers = [canvas.controls, canvas.tokens, canvas.interface].filter(Boolean);
        for (const layer of layers) {
            if (layer && layer.children) {
                const toRemove = layer.children.filter((c: any) => c.name === 'swarmCompanionRulerPreview');
                for (const child of toRemove) {
                    layer.removeChild(child);
                    try { child.destroy(); } catch (e) {}
                }
            }
        }
    },

    registerHooks: () => {
        Hooks.on('createToken', (tokenDoc: TokenDocument) => {
            void SwarmTileHooks.syncSwarmTiles(tokenDoc);
        });
        Hooks.on('updateToken', (tokenDoc: TokenDocument, updateData: any, options: any) => {
            void SwarmTileHooks.onUpdateToken(tokenDoc, updateData, options);
        });
        Hooks.on('deleteToken', (tokenDoc: TokenDocument) => {
            void SwarmTileHooks.onDeleteToken(tokenDoc);
        });
        Hooks.on('updateActor', (actorDoc: any, updateData: any) => {
            void SwarmTileHooks.onUpdateActor(actorDoc, updateData);
        });
    },

    /**
     * Synchronize visual companion swarm Tiles on the scene to match actor.system.swarm.count and primary token position.
     */
    syncSwarmTiles: async (primaryToken: TokenDocument, updateData?: any, options?: any) => {
        if (!game.user?.isGM || isProcessingSwarm) return;
        const scene = primaryToken.parent as Scene | null;
        if (!scene || !canvas.ready || scene.id !== canvas.scene?.id) return;

        const actor = primaryToken.actor as SR5Actor | null;
        if (!actor || !actor.isType('vehicle')) return;

        const system = actor.system as any;
        const isSwarm = Boolean(system.swarm?.active ?? system.isSwarm);
        const targetSwarmCount = isSwarm ? Math.max(2, Number(system.swarm?.count ?? system.swarmCount) || 2) : 1;
        const desiredCompanions = targetSwarmCount - 1;

        const primaryId = primaryToken.id || undefined;
        if (!primaryId) return;

        isProcessingSwarm = true;
        try {
            const primaryActorUuid = actor.uuid;
            const companionImage = primaryToken.texture?.src || actor.img || '';

            // Find existing companion tiles for this primary token / actor on the active scene
            const existingCompanionTiles = scene.tiles.filter(t => {
                const flags = getSwarmTileFlags(t);
                if (!flags.isSwarmTile) return false;
                if (flags.swarmPrimaryTokenId === primaryId) return true;
                if (flags.swarmActorUuid === primaryActorUuid) return true;
                return false;
            });

            // 1. Determine sub-drone ratio & target scale for primary token & companion tiles
            let subRatio = 1.0;
            if (isSwarm && targetSwarmCount > 1) {
                if (targetSwarmCount === 2) subRatio = 0.38;
                else if (targetSwarmCount === 3) subRatio = 0.33;
                else if (targetSwarmCount === 4) subRatio = 0.30;
                else if (targetSwarmCount === 5) subRatio = 0.28;
                else if (targetSwarmCount <= 7) subRatio = 0.26;
                else if (targetSwarmCount <= 10) subRatio = 0.24;
                else subRatio = Math.max(0.18, 0.24 - 0.008 * targetSwarmCount);
            }

            const currentScale = (primaryToken.texture as any)?.scaleX ?? (primaryToken as any).scale ?? 1.0;
            const rawTint = (primaryToken.texture as any)?.tint;
            const currentTintHex = rawTint ? ((rawTint as any).css ?? String(rawTint)) : null;
            const prototypeScale = (actor.prototypeToken as any)?.texture?.scaleX ?? (actor.prototypeToken as any)?.scale ?? 1.0;
            const targetScale = isSwarm && targetSwarmCount > 1 ? prototypeScale * subRatio : prototypeScale;
            const targetTint = isSwarm && targetSwarmCount > 1 ? '#ffe033' : null;

            // Update primary token texture scale and yellow tint if changed (locking anchor to center 0.5, 0.5 and offset 0, 0)
            if (Math.abs(currentScale - targetScale) > 0.01 || currentTintHex !== targetTint) {
                try {
                    await (primaryToken as any).update({
                        'texture.scaleX': targetScale,
                        'texture.scaleY': targetScale,
                        'texture.tint': targetTint,
                        'texture.anchorX': 0.5,
                        'texture.anchorY': 0.5,
                        'texture.offsetX': 0,
                        'texture.offsetY': 0
                    });
                } catch (e) {
                    console.warn('Shadowrun5e | SwarmTileHooks: Token texture update failed:', e);
                }
            }

            if (!isSwarm || desiredCompanions <= 0) {
                if (existingCompanionTiles.length > 0) {
                    const idsToDelete = existingCompanionTiles.map(t => t.id).filter(Boolean) as string[];
                    await scene.deleteEmbeddedDocuments('Tile', idsToDelete);
                    if (system.swarm) {
                        await (actor as any).update({ 'system.swarm.tiles.uuids': [], 'system.swarm.tiles.image': companionImage });
                    }
                }
                return;
            }

            const gridSize = (canvas.grid as any)?.size || (scene.grid as any)?.size || 100;
            const tokenW = primaryToken.width || 1;
            const tokenH = primaryToken.height || 1;
            const totalW = tokenW * gridSize;
            const totalH = tokenH * gridSize;

            const destTokenX = typeof updateData?.x === 'number' ? updateData.x : primaryToken.x;
            const destTokenY = typeof updateData?.y === 'number' ? updateData.y : primaryToken.y;

            const startTokenX = primaryToken.x;
            const startTokenY = primaryToken.y;

            const destCenterX = destTokenX + (totalW / 2);
            const destCenterY = destTokenY + (totalH / 2);

            const destCoords = calculateCompanionCoords({
                centerX: destCenterX,
                centerY: destCenterY,
                totalW,
                totalH,
                subRatio,
                desiredCompanions
            });

            const startCenterX = startTokenX + (totalW / 2);
            const startCenterY = startTokenY + (totalH / 2);

            const startCoords = calculateCompanionCoords({
                centerX: startCenterX,
                centerY: startCenterY,
                totalW,
                totalH,
                subRatio,
                desiredCompanions
            });

            const tileUpdates: any[] = [];

            for (let i = 0; i < existingCompanionTiles.length && i < desiredCompanions; i++) {
                const companionTile = existingCompanionTiles[i];
                const targetCoord = destCoords[i];

                if (
                    companionTile.x !== targetCoord.x ||
                    companionTile.y !== targetCoord.y ||
                    companionTile.width !== targetCoord.width ||
                    companionTile.height !== targetCoord.height ||
                    companionTile.texture?.src !== companionImage
                ) {
                    tileUpdates.push({
                        _id: companionTile.id,
                        x: targetCoord.x,
                        y: targetCoord.y,
                        width: targetCoord.width,
                        height: targetCoord.height,
                        texture: {
                            src: companionImage,
                            anchorX: 0.5,
                            anchorY: 0.5
                        },
                        locked: true,
                        flags: {
                            [SYSTEM_NAME]: {
                                isSwarmTile: true,
                                swarmPrimaryTokenId: primaryId,
                                swarmActorUuid: primaryActorUuid
                            }
                        }
                    });
                }
            }

            const isTokenMove = typeof updateData?.x === 'number' || typeof updateData?.y === 'number';
            const isAnimatedMove = isTokenMove && options?.animate !== false;

            if (tileUpdates.length > 0) {
                if (isAnimatedMove) {
                    const duration = typeof options?.duration === 'number' ? options.duration : 500;
                    setTimeout(() => {
                        void scene.updateEmbeddedDocuments('Tile', tileUpdates);
                    }, duration + 50);
                } else {
                    await scene.updateEmbeddedDocuments('Tile', tileUpdates);
                }
            }

            const currentActiveTileIds: string[] = existingCompanionTiles.slice(0, desiredCompanions).map(t => t.id).filter(Boolean) as string[];

            // Spawn missing companion tiles if desiredCompanions > existingCompanionTiles
            if (existingCompanionTiles.length < desiredCompanions) {
                const needed = desiredCompanions - existingCompanionTiles.length;
                const newTilesData: any[] = [];

                for (let i = 0; i < needed; i++) {
                    const companionIndex = existingCompanionTiles.length + i;
                    const targetCoord = destCoords[companionIndex];

                    const tileData: any = {
                        texture: {
                            src: companionImage,
                            anchorX: 0.5,
                            anchorY: 0.5
                        },
                        x: targetCoord.x,
                        y: targetCoord.y,
                        width: targetCoord.width,
                        height: targetCoord.height,
                        rotation: 0,
                        locked: true,
                        flags: {
                            [SYSTEM_NAME]: {
                                isSwarmTile: true,
                                swarmPrimaryTokenId: primaryId,
                                swarmActorUuid: primaryActorUuid
                            }
                        }
                    };

                    newTilesData.push(tileData);
                }

                const createdTiles = await scene.createEmbeddedDocuments('Tile', newTilesData);
                for (const createdTile of createdTiles) {
                    if (createdTile.id) currentActiveTileIds.push(createdTile.id);
                }
            } else if (existingCompanionTiles.length > desiredCompanions) {
                const idsToDelete = existingCompanionTiles.slice(desiredCompanions).map(t => t.id).filter(Boolean) as string[];
                await scene.deleteEmbeddedDocuments('Tile', idsToDelete);
            }

            // Store tile IDs in DataModel
            if (system.swarm) {
                await (actor as any).update({
                    'system.swarm.tiles.uuids': currentActiveTileIds,
                    'system.swarm.tiles.image': companionImage
                });
            }
        } finally {
            isProcessingSwarm = false;
        }
    },

    onUpdateToken: async (tokenDoc: TokenDocument, updateData?: any, options?: any) => {
        if (!game.user?.isGM || isProcessingSwarm) return;
        const scene = tokenDoc.parent as Scene | null;
        if (!scene || !canvas.ready || scene.id !== canvas.scene?.id) return;

        await SwarmTileHooks.syncSwarmTiles(tokenDoc, updateData, options);
    },

    onDeleteToken: async (tokenDoc: TokenDocument) => {
        if (!game.user?.isGM || isProcessingSwarm) return;
        const scene = tokenDoc.parent as Scene | null;
        if (!scene || !canvas.ready || scene.id !== canvas.scene?.id) return;

        const primaryId = tokenDoc.id || undefined;
        const primaryActorUuid = tokenDoc.actor?.uuid;

        isProcessingSwarm = true;
        try {
            const companionTiles = scene.tiles.filter(t => {
                const f = getSwarmTileFlags(t);
                if (!f.isSwarmTile) return false;
                if (f.swarmPrimaryTokenId === primaryId) return true;
                if (f.swarmActorUuid === primaryActorUuid) return true;
                return false;
            });

            if (companionTiles.length > 0) {
                const idsToDelete = companionTiles.map(c => c.id).filter(Boolean) as string[];
                await scene.deleteEmbeddedDocuments('Tile', idsToDelete);
            }
        } finally {
            isProcessingSwarm = false;
        }
    },

    onUpdateActor: async (actorDoc: any, updateData: any) => {
        if (!game.user?.isGM || isProcessingSwarm) return;
        if (actorDoc.type !== 'vehicle') return;

        const system = actorDoc.system as any;
        const isSwarm = Boolean(system.swarm?.active ?? system.isSwarm);

        // Convert condition monitor damage to reduced swarm count
        const physTrack = system.track?.physical;
        if (isSwarm && physTrack && updateData?.system?.track?.physical?.value !== undefined) {
            const maxConditionPerDrone = 8 + Math.ceil((system.attributes?.body?.value || 0) / 2);
            const currentDamage = physTrack.value || 0;
            const currentCount = Number(system.swarm?.count ?? system.swarmCount) || 1;

            if (currentDamage >= maxConditionPerDrone && currentCount > 1) {
                const destroyedDrones = Math.floor(currentDamage / maxConditionPerDrone);
                if (destroyedDrones > 0) {
                    const newCount = Math.max(1, currentCount - destroyedDrones);
                    const remainingDamage = currentDamage % maxConditionPerDrone;

                    console.log(`Shadowrun5e | SwarmTileHooks: Drone swarm took ${currentDamage} damage. Reducing swarm count from ${currentCount} to ${newCount}`);

                    isProcessingSwarm = true;
                    try {
                        if (system.swarm) {
                            await actorDoc.update({
                                'system.swarm.count': newCount,
                                'system.track.physical.value': remainingDamage
                            });
                        } else {
                            await actorDoc.update({
                                'system.swarmCount': newCount,
                                'system.track.physical.value': remainingDamage
                            });
                        }
                    } finally {
                        isProcessingSwarm = false;
                    }
                }
            }
        }

        const scene = canvas.scene;
        if (!scene) return;

        const primaryTokens = scene.tokens.filter(t => {
            if (!t.actor) return false;
            const actorId = t.actor.id;
            const baseActorId = (t.actor as any).baseActor?.id || actorId;
            return t.actorId === actorDoc.id || actorId === actorDoc.id || baseActorId === actorDoc.id || t.actor.uuid === actorDoc.uuid;
        });
        for (const token of primaryTokens) {
            await SwarmTileHooks.syncSwarmTiles(token);
        }
    },

    animateSwarmTilesOnTokenMove: (
        token: any,
        moveData: { fromX: number; fromY: number; toX: number; toY: number },
        duration: number,
        options?: any
    ) => {
        if (!canvas.ready || !token) return;
        const tokenDoc = token.document || token;
        const scene = tokenDoc.parent as Scene | null;
        if (!scene || scene.id !== canvas.scene?.id) return;

        const actor = (token.actor || tokenDoc.actor) as SR5Actor | null;
        if (!actor || !actor.isType('vehicle')) return;

        const system = actor.system as any;
        const isSwarm = Boolean(system.swarm?.active ?? system.isSwarm);
        if (!isSwarm) return;

        const targetSwarmCount = Math.max(2, Number(system.swarm?.count ?? system.swarmCount) || 2);
        const desiredCompanions = targetSwarmCount - 1;
        if (desiredCompanions <= 0) return;

        const primaryId = tokenDoc.id || undefined;
        const primaryActorUuid = actor.uuid;

        const companionTiles = scene.tiles.filter(t => {
            const flags = getSwarmTileFlags(t);
            if (!flags.isSwarmTile) return false;
            if (flags.swarmPrimaryTokenId === primaryId) return true;
            if (flags.swarmActorUuid === primaryActorUuid) return true;
            return false;
        });

        if (companionTiles.length === 0) return;

        SwarmTileHooks.clearSwarmRulerPreviews();

        const gridSize = (canvas.grid as any)?.size || (scene as any)?.grid?.size || 100;
        const tokenW = tokenDoc.width || 1;
        const tokenH = tokenDoc.height || 1;
        const totalW = tokenW * gridSize;
        const totalH = tokenH * gridSize;

        let subRatio = 1.0;
        if (targetSwarmCount === 2) subRatio = 0.38;
        else if (targetSwarmCount === 3) subRatio = 0.33;
        else if (targetSwarmCount === 4) subRatio = 0.30;
        else if (targetSwarmCount === 5) subRatio = 0.28;
        else if (targetSwarmCount <= 7) subRatio = 0.26;
        else if (targetSwarmCount <= 10) subRatio = 0.24;
        else subRatio = Math.max(0.18, 0.24 - 0.008 * targetSwarmCount);

        const startCenterX = moveData.fromX + (totalW / 2);
        const startCenterY = moveData.fromY + (totalH / 2);
        const startCoords = calculateCompanionCoords({
            centerX: startCenterX,
            centerY: startCenterY,
            totalW,
            totalH,
            subRatio,
            desiredCompanions
        });

        const destCenterX = moveData.toX + (totalW / 2);
        const destCenterY = moveData.toY + (totalH / 2);
        const destCoords = calculateCompanionCoords({
            centerX: destCenterX,
            centerY: destCenterY,
            totalW,
            totalH,
            subRatio,
            desiredCompanions
        });

        const companionImage = tokenDoc.texture?.src || actor.img || '';
        const tileUpdates: any[] = [];
        const staggerPerTile = Math.min(30, Math.floor(duration / (desiredCompanions * 2)));

        for (let i = 0; i < companionTiles.length && i < desiredCompanions; i++) {
            const tileDoc = companionTiles[i];
            const tileObject = (tileDoc as any).object || (canvas.tiles as any)?.get?.(tileDoc.id);
            if (!tileObject) continue;

            const startCoord = startCoords[i];
            const targetCoord = destCoords[i];

            tileUpdates.push({
                _id: tileDoc.id,
                x: targetCoord.x,
                y: targetCoord.y,
                width: targetCoord.width,
                height: targetCoord.height,
                texture: {
                    src: companionImage,
                    anchorX: 0.5,
                    anchorY: 0.5
                },
                locked: true,
                flags: {
                    [SYSTEM_NAME]: {
                        isSwarmTile: true,
                        swarmPrimaryTokenId: primaryId,
                        swarmActorUuid: primaryActorUuid
                    }
                }
            });

            const staggerDelay = i * staggerPerTile;
            const animDuration = Math.max(200, duration - staggerDelay);

            animateSwarmTile(tileObject, startCoord.x, startCoord.y, targetCoord.x, targetCoord.y, staggerDelay, animDuration);
        }

        if (tileUpdates.length > 0 && game.user?.isGM) {
            setTimeout(() => {
                void scene.updateEmbeddedDocuments('Tile', tileUpdates);
            }, duration + 50);
        }
    }
};
