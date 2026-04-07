import { VersionMigration } from "../VersionMigration";

/**
 * Migration for version 0.32.4:
 * - Fixes typo in demolitions skill id from 'deomilitions' to 'demolitions' in actor data.
 *   This corrects data created under version 0.30.0 where the skill id was misspelled.
 */
export class Version0_32_4 extends VersionMigration {
    readonly TargetVersion = "0.32.4";

    override handlesActor(_actor: any): boolean {
        return _actor.system?.skills?.active?.demolitions?.id === 'deomilitions';
    }

    override migrateActor(_actor: any): void {
        const skills = _actor.system?.skills?.active;
        if (!skills) return;

        if (skills.demolitions?.id === 'deomilitions') {
            skills.demolitions.id = 'demolitions';
        }
    }
}
