import { SR5Actor } from '@/module/actor/SR5Actor';
import { SYSTEM_NAME } from '@/module/constants';

const activeSwarmSyncs = new Set<string>();

export const getSwarmSubRatio = (targetSwarmCount: number): number => {
    if (targetSwarmCount <= 1) return 1.0;
    if (targetSwarmCount === 2) return 0.38;
    if (targetSwarmCount === 3) return 0.33;
    if (targetSwarmCount === 4) return 0.30;
    if (targetSwarmCount === 5) return 0.28;
    if (targetSwarmCount <= 7) return 0.26;
    if (targetSwarmCount <= 10) return 0.24;
    return Math.max(0.18, 0.24 - 0.008 * targetSwarmCount);
};

const getSwarmTileFlags = (tile: TileDocument): { isSwarmTile: boolean; swarmPrimaryTokenId: string | undefined; swarmActorUuid: string | undefined } => {
    const isTile = Boolean(tile.getFlag(SYSTEM_NAME, 'isSwarmTile'));
    const primaryId = tile.getFlag(SYSTEM_NAME, 'swarmPrimaryTokenId');
    const actorUuid = tile.getFlag(SYSTEM_NAME, 'swarmActorUuid');

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

    const tileDoc = tileObject.document || tileObject;
    const animName = `swarmTile_${tileObject.id || Math.random()}`;

    try {
        const CanvasAnim = (foundry as any)?.canvas?.animation?.CanvasAnimation || (globalThis as any).CanvasAnimation;
        if (CanvasAnim && typeof CanvasAnim.terminateAnimation === 'function') {
            CanvasAnim.terminateAnimation(animName);
        }
    } catch (e) {
        console.warn('Shadowrun5e | SwarmTileHooks: Failed to terminate canvas animation', e);
    }

    const setTilePos = (x: number, y: number) => {
        try {
            if (tileDoc) {
                if ('shape' in tileDoc && tileDoc.shape && typeof tileDoc.shape === 'object') {
                    Object.assign(tileDoc.shape, { x, y });
                }
                tileDoc.x = x;
                tileDoc.y = y;
            }
            tileObject.x = x;
            tileObject.y = y;
            if (tileObject.mesh && typeof tileObject.mesh.position?.set === 'function') {
                tileObject.mesh.position.set(x, y);
            }
            if (tileObject.bg && typeof tileObject.bg.position?.set === 'function') {
                tileObject.bg.position.set(x, y);
            }
            if (tileObject.position && typeof tileObject.position.set === 'function') {
                tileObject.position.set(x, y);
            }
            if (typeof tileObject._refreshPosition === 'function') {
                tileObject._refreshPosition();
            } else if (typeof tileObject.refresh === 'function') {
                tileObject.refresh();
            }
        } catch (e) {
            console.warn('Shadowrun5e | SwarmTileHooks: Failed to set tile position', e);
        }
    };

    setTilePos(fromX, fromY);

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
                        setTilePos(tileObject.x, tileObject.y);
                    }
                });
            } else {
                setTilePos(targetX, targetY);
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
                    try { child.destroy(); } catch (e) {
                        console.warn('Shadowrun5e | SwarmTileHooks: Failed to destroy ruler preview child', e);
                    }
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
        if (!game.users?.activeGM?.isSelf) return;
        const scene = primaryToken.parent as Scene | null;
        if (!scene || !canvas.ready || scene.id !== canvas.scene?.id) return;

        const actor = primaryToken.actor as SR5Actor | null;
        if (!actor || !actor.isType('vehicle')) return;

        const primaryId = primaryToken.id || undefined;
        if (!primaryId) return;

        const syncKey = primaryId;
        if (activeSwarmSyncs.has(syncKey)) return;
        activeSwarmSyncs.add(syncKey);

        try {
            const system = actor.system;
            const isSwarm = Boolean(system.swarm.active);
            const targetSwarmCount = isSwarm ? Math.max(2, system.swarm.count ?? 2) : 1;
            const desiredCompanions = targetSwarmCount - 1;
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
            const subRatio = getSwarmSubRatio(targetSwarmCount);

            const currentScale = (primaryToken.texture as any)?.scaleX ?? (primaryToken as any).scale ?? 1.0;
            const rawTint = (primaryToken.texture as any)?.tint;
            const currentTintHex = rawTint ? ((rawTint as any).css ?? String(rawTint)) : null;
            const prototypeScale = (actor.prototypeToken as any)?.texture?.scaleX ?? (actor.prototypeToken as any)?.scale ?? 1.0;

            if (isSwarm && targetSwarmCount > 1) {
                // Save original pre-swarm texture if not already stored
                const existingPreSwarm = primaryToken.getFlag(SYSTEM_NAME, 'preSwarmTexture') as { scaleX?: number; scaleY?: number; tint?: string | null } | undefined;
                const targetScale = prototypeScale * subRatio;
                const targetTint = '#ffe033';

                if (Math.abs(currentScale - targetScale) > 0.01 || currentTintHex !== targetTint) {
                    try {
                        const tokenUpdate: any = {
                            'texture.scaleX': targetScale,
                            'texture.scaleY': targetScale,
                            'texture.tint': targetTint,
                            'texture.anchorX': 0.5,
                            'texture.anchorY': 0.5,
                            'texture.offsetX': 0,
                            'texture.offsetY': 0
                        };
                        if (!existingPreSwarm) {
                            tokenUpdate[`flags.${SYSTEM_NAME}.preSwarmTexture`] = {
                                scaleX: currentScale,
                                scaleY: (primaryToken.texture as any)?.scaleY ?? (primaryToken as any).scale ?? 1.0,
                                tint: currentTintHex
                            };
                        }
                        await (primaryToken as any).update(tokenUpdate);
                    } catch (e) {
                        console.warn('Shadowrun5e | SwarmTileHooks: Token texture update failed:', e);
                    }
                }
            } else {
                // Swarm deactivated: restore pre-swarm texture if saved
                const saved = primaryToken.getFlag(SYSTEM_NAME, 'preSwarmTexture') as { scaleX?: number; scaleY?: number; tint?: string | null } | undefined;
                if (saved !== undefined) {
                    try {
                        await (primaryToken as any).update({
                            'texture.scaleX': saved.scaleX ?? prototypeScale,
                            'texture.scaleY': saved.scaleY ?? prototypeScale,
                            'texture.tint': saved.tint ?? null,
                            [`flags.${SYSTEM_NAME}.-=preSwarmTexture`]: null
                        });
                    } catch (e) {
                        console.warn('Shadowrun5e | SwarmTileHooks: Failed to restore pre-swarm token texture:', e);
                    }
                }
            }

            if (!isSwarm || desiredCompanions <= 0) {
                if (existingCompanionTiles.length > 0) {
                    const idsToDelete = existingCompanionTiles.map(t => t.id).filter(Boolean) as string[];
                    await scene.deleteEmbeddedDocuments('Tile', idsToDelete);
                    if (system.swarm) {
                        await actor.update({
                            system: {
                                swarm: {
                                    tiles: {
                                        uuids: [],
                                        image: companionImage
                                    }
                                }
                            }
                        });
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
                await actor.update({
                    system: {
                        swarm: {
                            tiles: {
                                uuids: currentActiveTileIds,
                                image: companionImage
                            }
                        }
                    }
                });
            }
        } finally {
            activeSwarmSyncs.delete(syncKey);
        }
    },

    onUpdateToken: async (tokenDoc: TokenDocument, updateData?: any, options?: any) => {
        if (!game.users?.activeGM?.isSelf) return;
        const scene = tokenDoc.parent as Scene | null;
        if (!scene || !canvas.ready || scene.id !== canvas.scene?.id) return;

        await SwarmTileHooks.syncSwarmTiles(tokenDoc, updateData, options);
    },

    onDeleteToken: async (tokenDoc: TokenDocument) => {
        if (!game.users?.activeGM?.isSelf) return;
        const scene = tokenDoc.parent as Scene | null;
        if (!scene || !canvas.ready || scene.id !== canvas.scene?.id) return;

        const primaryId = tokenDoc.id || undefined;
        const primaryActorUuid = tokenDoc.actor?.uuid;
        const syncKey = primaryId ?? primaryActorUuid;
        if (!syncKey || activeSwarmSyncs.has(syncKey)) return;

        activeSwarmSyncs.add(syncKey);
        try {
            const companionTiles = scene.tiles.filter(t => {
                const f = getSwarmTileFlags(t);
                if (!f.isSwarmTile) return false;
                if (primaryId && f.swarmPrimaryTokenId === primaryId) return true;
                if (primaryActorUuid && f.swarmActorUuid === primaryActorUuid) return true;
                return false;
            });

            if (companionTiles.length > 0) {
                const idsToDelete = companionTiles.map(c => c.id).filter(Boolean) as string[];
                await scene.deleteEmbeddedDocuments('Tile', idsToDelete);
            }
        } finally {
            activeSwarmSyncs.delete(syncKey);
        }
    },

    onUpdateActor: async (actorDoc: SR5Actor, updateData: any) => {
        if (!game.users?.activeGM?.isSelf) return;
        if (!actorDoc.isType('vehicle')) return;

        const system = actorDoc.system;
        const isSwarm = Boolean(system.swarm.active);

        // Convert condition monitor damage to reduced swarm count
        const physTrack = system.track.physical;
        if (isSwarm && physTrack && updateData?.system?.track?.physical?.value !== undefined) {
            const maxConditionPerDrone = physTrack.max || (8 + Math.ceil((system.attributes.body.value || 0) / 2));
            const currentDamage = physTrack.value || 0;
            const currentCount = Number(system.swarm.count) || 1;

            if (maxConditionPerDrone > 0 && currentDamage >= maxConditionPerDrone && currentCount > 1) {
                const destroyedDrones = Math.floor(currentDamage / maxConditionPerDrone);
                if (destroyedDrones > 0) {
                    const newCount = Math.max(1, currentCount - destroyedDrones);
                    const remainingDamage = currentDamage % maxConditionPerDrone;

                    console.log(`Shadowrun5e | SwarmTileHooks: Drone swarm took ${currentDamage} damage. Reducing swarm count from ${currentCount} to ${newCount}`);

                    const syncKey = actorDoc.uuid || actorDoc.id;
                    if (syncKey) activeSwarmSyncs.add(syncKey);
                    try {
                        await actorDoc.update({
                            system: {
                                swarm: { count: newCount },
                                track: { physical: { value: remainingDamage } }
                            }
                        });
                    } finally {
                        if (syncKey) activeSwarmSyncs.delete(syncKey);
                    }
                }
            }
        }

        const scene = canvas.scene;
        if (!scene) return;

        const primaryTokens = scene.tokens.filter(t => {
            if (!t.actor) return false;
            const actorId = t.actor.id;
            return t.actorId === actorDoc.id || actorId === actorDoc.id || t.actor.uuid === actorDoc.uuid;
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

        const system = actor.system;
        const isSwarm = Boolean(system.swarm.active);
        if (!isSwarm) return;

        const targetSwarmCount = Math.max(2, system.swarm.count ?? 2);
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

        const subRatio = getSwarmSubRatio(targetSwarmCount);

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

        if (tileUpdates.length > 0 && game.users?.activeGM?.isSelf) {
            setTimeout(() => {
                void scene.updateEmbeddedDocuments('Tile', tileUpdates);
            }, duration + 50);
        }
    }
};
