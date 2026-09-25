const { BooleanField, DocumentUUIDField, NumberField, SetField } = foundry.data.fields;

export const ASTRAL_BARRIER_REGION_BEHAVIOR = 'shadowrun5e.astralBarrier';
export const ASTRAL_WARD_REGION_BEHAVIOR = 'shadowrun5e.astralWard';

const AstralBoundaryData = () => ({
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
});

export abstract class AstralBoundaryRegionBehavior
    extends foundry.data.regionBehaviors.RegionBehaviorType<ReturnType<typeof AstralBoundaryData>> {
    static override defineSchema() {
        return AstralBoundaryData();
    }
}

export class AstralBarrierRegionBehavior extends AstralBoundaryRegionBehavior {
    static override LOCALIZATION_PREFIXES = ['SR5.Vision.AstralRegions.Barrier'];
}

export class AstralWardRegionBehavior extends AstralBoundaryRegionBehavior {
    static override LOCALIZATION_PREFIXES = ['SR5.Vision.AstralRegions.Ward'];
}

export type AstralBoundaryType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof AstralBoundaryData>>;
