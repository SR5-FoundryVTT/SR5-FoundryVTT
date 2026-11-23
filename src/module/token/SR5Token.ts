import { FLAGS, SYSTEM_NAME } from '../constants';
import { AstralRegionFlow } from '@/module/vision/astralRegions/AstralRegionFlow';
import { ULTRASOUND_VISION_MODE } from '@/module/vision/ultrasoundVision/ultrasoundDetectionMode';
import { SenseFilterResolver } from '@/module/vision/SenseFilterResolver';
import type AugmentedRealityFilter from '@/module/vision/augmentedReality/arFilter';
import { getProjectionForm } from '@/module/vision/astralProjection/AstralProjectionState';
import { MANIFEST_STATUS, MATERIALIZE_STATUS } from '@/module/vision/astralProjection/ManifestationState';
import { ManifestationFilter } from '@/module/vision/astralProjection/manifestationFilter';
import { getPhysicalPresence } from '@/module/vision/physicalVision/physicalDetectionMode';
import { isNonOpticalVisionMode } from '@/module/vision/SR5VisionSource';

export class SR5Token extends foundry.canvas.placeables.Token {
    /** Filters drawn over this token after its detection filter, like an aura or a Matrix icon. */
    private readonly senseOverlays: PIXI.Filter[] = [];

    /** Filter showing this token as a manifesting astral being, while it is one. */
    private manifestFilter: ManifestationFilter | null = null;

    /**
     * Let astral forms move through physical walls, and stop them before astral boundaries instead, so
     * drag previews and executed movement end in front of those the same way they end in front of walls.
     *
     * SR5#314 only the Earth is solid to an astral form, which scene walls don't model.
     */
    override constrainMovementPath(
        ...args: Parameters<foundry.canvas.placeables.Token['constrainMovementPath']>
    ): ReturnType<foundry.canvas.placeables.Token['constrainMovementPath']> {
        const [waypoints, options] = args;
        const [path, constrained] = AstralRegionFlow.isAstralOnly(this.document)
            ? super.constrainMovementPath(waypoints, { ...options, ignoreWalls: true })
            : super.constrainMovementPath(...args);
        if (options?.ignoreWalls) return [path, constrained];
        // Keep previews wall-like, but let the document pre-movement hook reject executed crossings
        // in full and notify the acting user.
        if (!options?.preview) return [path, constrained];
        const astralPath = AstralRegionFlow.constrainMovementPath(this.document, path as any);
        return astralPath ? [astralPath as typeof path, true] : [path, constrained];
    }

    /**
     * Swap the detection filter for the one matching this token and the current viewers' senses, and gather the
     * overlays of senses layered on top. Without a detection filter of its own, the first overlay takes its place
     * so Foundry renders the filter pass at all.
     */
    override get isVisible() {
        const visible = super.isVisible;
        const overlays = this.senseOverlays;
        if (!visible) {
            overlays.length = 0;
            return visible;
        }
        const primary = SenseFilterResolver.resolve(this, this.detectionFilter) ?? null;
        SenseFilterResolver.collectOverlays(this, primary, overlays);
        this.detectionFilter = primary ?? overlays.shift() ?? null;
        return visible;
    }

    /** A token only found through a trace shows as its icon's marker, not as whatever carries it. */
    override _refreshVisibility() {
        super._refreshVisibility();
        if ((this.detectionFilter as AugmentedRealityFilter | null)?.locatesOnly) this.mesh!.visible = false;
    }

    /**
     * Render the detection filter, then each sense overlay on top of it.
     *
     * The marker of a traced icon is drawn from the hidden mesh, which Pixi neither renders nor moves.
     */
    override _renderDetectionFilter(renderer: PIXI.Renderer) {
        const mesh = this.mesh;
        if (!mesh) return;
        const hidden = !mesh.visible;
        if (hidden) {
            mesh.visible = true;
            mesh.updateTransform();
        }
        super._renderDetectionFilter(renderer);
        const primary = this.detectionFilter;
        for (const overlay of this.senseOverlays) {
            this.detectionFilter = overlay;
            super._renderDetectionFilter(renderer);
        }
        this.detectionFilter = primary;
        if (hidden) mesh.visible = false;
    }

    /**
     * Manifesting and materializing change which senses detect this token and how it looks. The astral form of
     * an unlinked body isn't among the actor's dependent tokens, so it is refreshed along with its body.
     */
    protected override _onApplyStatusEffect(statusId: string, active: boolean) {
        super._onApplyStatusEffect(statusId, active);
        if (statusId !== MANIFEST_STATUS && statusId !== MATERIALIZE_STATUS) return;
        canvas.perception.update({ refreshVision: true });
        this._updateSpecialStatusFilterEffects();
        const form = getProjectionForm(this.document)?.object as SR5Token | null | undefined;
        form?._updateSpecialStatusFilterEffects();
    }

    protected override _updateSpecialStatusFilterEffects() {
        super._updateSpecialStatusFilterEffects();
        const mesh = this.mesh;
        if (!mesh) return;
        const manifesting = getPhysicalPresence(this) === 'manifest';
        if (manifesting && !this.manifestFilter) this.manifestFilter = ManifestationFilter.create() as ManifestationFilter;
        if (!this.manifestFilter) return;
        this.manifestFilter.enabled = manifesting;
        mesh.filters ??= [];
        if (manifesting && !mesh.filters.includes(this.manifestFilter)) mesh.filters.push(this.manifestFilter);
    }

    protected override _removeAllFilterEffects() {
        super._removeAllFilterEffects();
        const filters = this.mesh?.filters;
        const index = this.manifestFilter && filters ? filters.indexOf(this.manifestFilter) : -1;
        if (index >= 0) filters!.splice(index, 1);
        this.manifestFilter = null;
    }

    /** Astral sight and ultrasound aren't optical, and ultrasound works in any light. */
    override _getVisionBlindedStates() {
        const states = super._getVisionBlindedStates();
        const { visionMode } = this.document.sight;
        if (isNonOpticalVisionMode(visionMode)) states.blind = false;
        if (visionMode === ULTRASOUND_VISION_MODE) states.darkness = false;
        return states;
    }

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
}
