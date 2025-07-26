import { VersionMigration } from "../VersionMigration";

/**
 * Version 0.18.0 disables Foundry CONFIG.Active.Effect.legacyTransferal.
 * 
 * This causes effects on owned items to also be applied on actors. As these effects will have been
 * transferred onto the actor before, they're now collected and applied twice.
 * 
 * Therefore effects with a owned item source are deleted. Effects without an
 * existing origin item on their parent actor will be left in place.
 */
export class Version0_18_0 extends VersionMigration {
    readonly TargetVersion = '0.18.1';

    override handlesActor(actor: Readonly<any>): boolean {
        return Array.isArray(actor.effects);
    }

    override migrateActor(actor: any) {
        const toDelete = actor.effects.filter(effect => effect.origin?.includes('.Item.'));
        if (toDelete.length > 0) {
            console.log(`Actor (${actor._id}). Delete these effects:`, toDelete);
            actor.effects = actor.effects.filter(effect => !effect.origin?.includes('.Item.'));
        }
    }

    override migrateActiveEffect(effect: any) {
        effect.name ??= effect.label || "Unnamed Effect";
        delete effect.label;
    }
}
