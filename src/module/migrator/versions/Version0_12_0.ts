import { SR5Actor } from "../../actor/SR5Actor";
import { VersionMigration } from "../VersionMigration";

/**
 * Version 0.12.0 disables Foundry CONFIG.Active.Effect.legacyTransferal.
 * 
 * This causes effects on owned items to also be applied on actors. As these effects will have been
 * transfered onto the actor before, they're now collected and applied twice.
 * 
 * Therfore effects with a owned item source are deleted. Effects without an
 * existing origin item on their parent actor will be left in place.
 */
export class Version0_12_0 extends VersionMigration {
    // TODO: is this the last version with a migration?
    get SourceVersion(): string {
        return '0.8.0';
    }

    get TargetVersion(): string {
        return Version0_12_0.TargetVersion;
    }

    static get TargetVersion(): string {
        return '0.12.0';
    }

    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return !!actor.effects.find(effect => !!effect.origin);
    }

    /**
     * There is two ways of migrating...
     * 
     * 1. Delete effects with origin. Maybe check before if a similar effect exists on the origin.
     * 2. Disable effects with origin. let users delete.
     * 
     * @param data 
     */
    protected override async MigrateActorData(actor: SR5Actor) {
        await Version0_12_0.RemoveLocalItemOwnedEffects(actor);
        return {};
    }

    protected override async ShouldMigrateSceneData(scene) {
        return true;
    }

    /**
     * Check if an effect originates from an owned item.
     * 
     * NOTE: Since foundry copies the original items uuid as origin, this original origin
     * will be preserved for copies of that actor via tokens or packs. For these actors the
     * origin points to the original actor owned item, not the copied actors local item.
     * 
     * NOTE: As the system only ever used FoundryVTT core functionality in regards of how
     * effects where applied, we delete ALL item origin effects.
     * 
     * @param actor 
     */
    static async RemoveLocalItemOwnedEffects(actor: SR5Actor) {
        const itemOriginEffects = actor.effects.filter(effect => effect.origin.includes('.Item.'));

        console.log(`Actor (${actor.uuid}). Delete these effects:`, itemOriginEffects);
        const toDelete: string[] = [];
        for (const effect of itemOriginEffects) {            
            toDelete.push(effect.id as string);
        }
        
        await actor.deleteEmbeddedDocuments('ActiveEffect', toDelete);
    }
}