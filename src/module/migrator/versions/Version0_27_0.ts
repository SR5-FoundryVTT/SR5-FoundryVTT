import { VersionMigration } from "../VersionMigration";

/**
 * Version 0.27.0
 * 
 * Fixing a few spirit type names to match the Chummer formatting.
 */

export class Version0_27_0 extends VersionMigration {
    readonly TargetVersion = "0.27.0";

    override handlesActor(actor: Readonly<any>) {
        return actor.type === 'spirit';
    }

    override migrateActor(actor: any) {
        // Rename spirit types to match Chummer formatting
        const spiritSystem = actor.system;
        if (spiritSystem.spiritType === 'nocnitasa')
            spiritSystem.spiritType = 'nocnitsa';
        if (spiritSystem.spiritType === 'greenman')
            spiritSystem.spiritType = 'green_man';
        if (spiritSystem.spiritType === 'vucub')
            spiritSystem.spiritType = 'vucub_caquix';
    }
}
