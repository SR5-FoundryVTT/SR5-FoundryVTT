import { Migrator } from "../migrator/Migrator";

/**
 * ActorDelta of unlinked tokens.
 *
 * Items created or changed on an unlinked token live in its delta as full item sources, which the
 * actor migrations never see, so the delta source is migrated here.
 */
export class SR5ActorDelta extends ActorDelta {
    static override migrateData(source: any) {
        Migrator.migrateActorDelta(source);
        return super.migrateData(source);
    }
}
