import { FLAGS, SYSTEM_NAME } from '../constants';
import { ensureSR5PlaceablePlanes, SR5_DEFAULT_PLACEABLE_PLANES, SR5PlaceablePlanes } from '../environment/placeablePlanes';

type SceneControlLike = {
    tools: Record<string, {
        name: string;
        title: string;
        icon: string;
        order: number;
        toggle: boolean;
        active: boolean;
        visible: boolean;
        onChange: (event: Event, active: boolean) => void | Promise<void>;
    }>;
};

type SceneControlsLike = Record<string, SceneControlLike>;

type PlaneToolConfig = {
    plane: keyof SR5PlaceablePlanes;
    name: string;
    title: string;
    icon: string;
};

const CONTROL_NAMES = ['walls', 'lighting', 'tiles'] as const;

const PLANE_TOOLS: PlaneToolConfig[] = [
    {
        plane: 'physical',
        name: 'sr5-plane-physical',
        title: 'SR5 Plane Brush: Physical',
        icon: 'fa-solid fa-person-running',
    },
    {
        plane: 'astral',
        name: 'sr5-plane-astral',
        title: 'SR5 Plane Brush: Astral',
        icon: 'fa-solid fa-star',
    },
    {
        plane: 'matrix',
        name: 'sr5-plane-matrix',
        title: 'SR5 Plane Brush: Matrix',
        icon: 'fa-solid fa-laptop-code',
    },
];

const getBrushState = (): SR5PlaceablePlanes => {
    const value = game.settings.get(SYSTEM_NAME, FLAGS.ScenePlaneBrushState);
    return ensureSR5PlaceablePlanes(value);
};

const syncPlaneToolStateAcrossControls = (plane: keyof SR5PlaceablePlanes, active: boolean) => {
    const controls = ui.controls?.controls as SceneControlsLike | undefined;
    if (!controls) {
        return;
    }

    const toolName = PLANE_TOOLS.find(tool => tool.plane === plane)?.name;
    if (!toolName) {
        return;
    }

    for (const controlName of CONTROL_NAMES) {
        const tool = controls[controlName]?.tools?.[toolName];
        if (tool) {
            tool.active = active;
        }
    }
};

const syncAllPlaneToolStatesAcrossControls = (state: SR5PlaceablePlanes) => {
    syncPlaneToolStateAcrossControls('physical', state.physical);
    syncPlaneToolStateAcrossControls('astral', state.astral);
    syncPlaneToolStateAcrossControls('matrix', state.matrix);
};

export class ScenePlaneBrushFlow {
    static getBrushState(): SR5PlaceablePlanes {
        return getBrushState();
    }

    static resolvePlanesForCreatedPlaceable(rawPlanes: unknown): SR5PlaceablePlanes {
        const source = (rawPlanes ?? {}) as Record<string, unknown>;
        const brushState = getBrushState();

        return {
            physical: typeof source[FLAGS.PlanePhysical] === 'boolean'
                ? source[FLAGS.PlanePhysical] as boolean
                : brushState.physical,
            astral: typeof source[FLAGS.PlaneAstral] === 'boolean'
                ? source[FLAGS.PlaneAstral] as boolean
                : brushState.astral,
            matrix: typeof source[FLAGS.PlaneMatrix] === 'boolean'
                ? source[FLAGS.PlaneMatrix] as boolean
                : brushState.matrix,
        };
    }

    private static applyPlaceablePlaneVisualState(
        placeable: {
            alpha?: number;
            eventMode?: string;
            interactive?: boolean;
        },
        shouldFilter: boolean,
        matchCount: number,
        selectedPlaneCount: number
    ) {
        if (!shouldFilter) {
            placeable.alpha = 1;
            if (typeof placeable.eventMode === 'string') {
                placeable.eventMode = 'static';
            }
            if (typeof placeable.interactive === 'boolean') {
                placeable.interactive = true;
            }
            return;
        }

        if (matchCount === 0) {
            placeable.alpha = 0.15;
            if (typeof placeable.eventMode === 'string') {
                placeable.eventMode = 'none';
            }
            if (typeof placeable.interactive === 'boolean') {
                placeable.interactive = false;
            }
            return;
        }

        if (matchCount < selectedPlaneCount) {
            placeable.alpha = 0.5;
            if (typeof placeable.eventMode === 'string') {
                placeable.eventMode = 'static';
            }
            if (typeof placeable.interactive === 'boolean') {
                placeable.interactive = true;
            }
            return;
        }

        placeable.alpha = 1;
        if (typeof placeable.eventMode === 'string') {
            placeable.eventMode = 'static';
        }
        if (typeof placeable.interactive === 'boolean') {
            placeable.interactive = true;
        }
    }

    static refreshWallEditPlaneVisibility() {
        const walls = canvas?.walls?.placeables;
        if (!walls) {
            return;
        }

        const controls = ui.controls as { activeControl?: string } | undefined;
        const activeControl = controls?.activeControl;
        const brushState = getBrushState();
        const selectedPlanes = (['physical', 'astral', 'matrix'] as const).filter(plane => brushState[plane]);
        const shouldFilterWalls = activeControl === 'walls' && selectedPlanes.length > 0;

        for (const wall of walls) {
            const planes = ensureSR5PlaceablePlanes(wall.document?.getFlag?.(SYSTEM_NAME, FLAGS.PlaceablePlanes));
            const matchCount = selectedPlanes.filter(plane => planes[plane]).length;
            this.applyPlaceablePlaneVisualState(wall, shouldFilterWalls, matchCount, selectedPlanes.length);
        }
    }

    static refreshLightEditPlaneVisibility() {
        const lights = canvas?.lighting?.placeables;
        if (!lights) {
            return;
        }

        const controls = ui.controls as { activeControl?: string } | undefined;
        const activeControl = controls?.activeControl;
        const brushState = getBrushState();
        const selectedPlanes = (['physical', 'astral', 'matrix'] as const).filter(plane => brushState[plane]);
        const shouldFilterLights = activeControl === 'lighting' && selectedPlanes.length > 0;

        for (const light of lights) {
            const planes = ensureSR5PlaceablePlanes(light.document?.getFlag?.(SYSTEM_NAME, FLAGS.PlaceablePlanes));
            const matchCount = selectedPlanes.filter(plane => planes[plane]).length;
            this.applyPlaceablePlaneVisualState(light, shouldFilterLights, matchCount, selectedPlanes.length);
        }
    }

    static refreshEditPlaneVisibility() {
        this.refreshWallEditPlaneVisibility();
        this.refreshLightEditPlaneVisibility();
    }

    static extendSceneControls(controls: SceneControlsLike) {
        if (!game.user?.isGM) {
            return;
        }

        const brushState = getBrushState();

        for (const controlName of CONTROL_NAMES) {
            const control = controls[controlName];
            if (!control?.tools) {
                continue;
            }

            let nextOrder = Object.keys(control.tools).length;
            for (const toolConfig of PLANE_TOOLS) {
                control.tools[toolConfig.name] = {
                    name: toolConfig.name,
                    title: toolConfig.title,
                    icon: toolConfig.icon,
                    order: nextOrder,
                    toggle: true,
                    active: brushState[toolConfig.plane],
                    visible: true,
                    onChange: async (_event, active) => {
                        const nextState = {
                            ...getBrushState(),
                            [toolConfig.plane]: !!active,
                        };

                        await game.settings.set(SYSTEM_NAME, FLAGS.ScenePlaneBrushState, nextState);
                        syncPlaneToolStateAcrossControls(toolConfig.plane, !!active);
                        this.refreshEditPlaneVisibility();
                    },
                };
                nextOrder += 1;
            }

            control.tools['sr5-plane-reset'] = {
                name: 'sr5-plane-reset',
                title: 'SR5 Plane Brush: Reset Defaults',
                icon: 'fa-solid fa-rotate-left',
                order: nextOrder,
                toggle: false,
                active: false,
                visible: true,
                onChange: async () => {
                    const resetState = { ...SR5_DEFAULT_PLACEABLE_PLANES };
                    await game.settings.set(SYSTEM_NAME, FLAGS.ScenePlaneBrushState, resetState);
                    syncAllPlaneToolStatesAcrossControls(resetState);
                    this.refreshEditPlaneVisibility();
                },
            };
        }

        this.refreshEditPlaneVisibility();
    }
}