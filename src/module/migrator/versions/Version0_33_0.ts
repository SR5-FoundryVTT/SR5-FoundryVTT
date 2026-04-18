import { VersionMigration } from "../VersionMigration";

/**
 * Make sure that readonly fields are set to their correct values.
 */
export class Version0_33_0 extends VersionMigration {
    readonly TargetVersion = "0.33.0";

    override handlesActiveEffect(_effect: Readonly<any>) {
        return _effect.changes.filter(change => change.mode === CONST.ACTIVE_EFFECT_MODES.CUSTOM).length > 0;
    }

    override migrateActiveEffect(effect: any) {
        for (const change of effect.changes)
            if (change.mode === CONST.ACTIVE_EFFECT_MODES.CUSTOM)
                change.mode = CONST.ACTIVE_EFFECT_MODES.ADD;
    }
}
