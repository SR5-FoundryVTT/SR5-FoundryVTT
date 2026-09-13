export const ASTRAL_BARRIER_REGION_BEHAVIOR = 'shadowrun5e.astralBarrier';
export const ASTRAL_WARD_REGION_BEHAVIOR = 'shadowrun5e.astralWard';

export interface AstralBoundaryBehaviorData {
    blockSight: boolean;
    blockMovement: boolean;
    force: number;
    allowedActors: Set<string>;
}

type AstralBoundarySchema = {
    blockSight: foundry.data.fields.BooleanField;
    blockMovement: foundry.data.fields.BooleanField;
    force: foundry.data.fields.NumberField;
    allowedActors: foundry.data.fields.SetField<foundry.data.fields.DocumentUUIDField>;
};

abstract class AstralBoundaryRegionBehavior
    extends foundry.data.regionBehaviors.RegionBehaviorType<AstralBoundarySchema> {
    static override defineSchema() {
        const { BooleanField, DocumentUUIDField, NumberField, SetField } = foundry.data.fields;
        return {
            // SR5#315 astral barriers are hazily opaque and only penalize vision, so fully blocking
            // astral sight is opt-in.
            blockSight: new BooleanField({
                required: true,
                initial: false,
                label: 'SR5.Vision.AstralRegions.BlockSight',
                hint: 'SR5.Vision.AstralRegions.BlockSightHint',
            }),
            blockMovement: new BooleanField({
                required: true,
                initial: true,
                label: 'SR5.Vision.AstralRegions.BlockMovement',
                hint: 'SR5.Vision.AstralRegions.BlockMovementHint',
            }),
            force: new NumberField({
                required: true,
                nullable: false,
                integer: true,
                min: 0,
                initial: 1,
                label: 'SR5.Vision.AstralRegions.Force',
                hint: 'SR5.Vision.AstralRegions.ForceHint',
            }),
            // SR5#315 barriers don't affect their creators, who may also let others through.
            allowedActors: new SetField(new DocumentUUIDField({ type: 'Actor' }), {
                label: 'SR5.Vision.AstralRegions.AllowedActors',
                hint: 'SR5.Vision.AstralRegions.AllowedActorsHint',
            }),
        };
    }

    declare blockSight: boolean;
    declare blockMovement: boolean;
    declare force: number;
    declare allowedActors: Set<string>;
}

export class AstralBarrierRegionBehavior extends AstralBoundaryRegionBehavior {
    static override LOCALIZATION_PREFIXES = ['SR5.Vision.AstralRegions.Barrier'];
}

export class AstralWardRegionBehavior extends AstralBoundaryRegionBehavior {
    static override LOCALIZATION_PREFIXES = ['SR5.Vision.AstralRegions.Ward'];
}

export const registerAstralRegionBehaviors = () => {
    CONFIG.RegionBehavior.dataModels[ASTRAL_BARRIER_REGION_BEHAVIOR] = AstralBarrierRegionBehavior;
    CONFIG.RegionBehavior.dataModels[ASTRAL_WARD_REGION_BEHAVIOR] = AstralWardRegionBehavior;
    CONFIG.RegionBehavior.typeIcons[ASTRAL_BARRIER_REGION_BEHAVIOR] = 'fa-solid fa-shield-halved';
    CONFIG.RegionBehavior.typeIcons[ASTRAL_WARD_REGION_BEHAVIOR] = 'fa-solid fa-shield';
    CONFIG.RegionBehavior.typeLabels[ASTRAL_BARRIER_REGION_BEHAVIOR] = 'SR5.Vision.AstralRegions.Barrier.Label';
    CONFIG.RegionBehavior.typeLabels[ASTRAL_WARD_REGION_BEHAVIOR] = 'SR5.Vision.AstralRegions.Ward.Label';
};
