import { SR5Actor } from "../../actor/SR5Actor";
import { FormDialog } from "../../apps/dialogs/FormDialog";
import { SR5ActiveEffect } from "../../effect/SR5ActiveEffect";
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
    // TODO: is this the last version with a migration?
    get SourceVersion(): string {
        return '0.17.0';
    }

    get TargetVersion(): string {
        return Version0_18_0.TargetVersion;
    }

    static get TargetVersion(): string {
        // First migration with 0.18.0 target didn't quite work out. This is the second attempt.
        return '0.18.1';
    }

    // By default item effects will be deleted. should users want to keep them, they can 
    // only have them disabled and manually review / remove each.
    private onlyDisableEffects = false;

    /**
     * Version 12 is introducing a breaking change with deleting effects.
     * 
     * Inform users about this and provide a less destructive option.
     */
    override async AskForUserConsentAndConfiguration() {
        const dialog = new ConfigurationDialog({onlyDisableEffects: this.onlyDisableEffects});
        await dialog.select();
        if (dialog.canceled) return false;

        // @ts-expect-error
        this.onlyDisableEffects = dialog.data.templateData.onlyDisableEffects;

        return true;
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
        if (!this.onlyDisableEffects) {
            await Version0_18_0.DeleteLocalItemOwnedEffects(actor);
            return {};
        }
        
        return Version0_18_0.DisableLocalItemOwnedEffects(actor);   
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
    static async DeleteLocalItemOwnedEffects(actor: SR5Actor) {
        const itemOriginEffects = migrateEffects(actor);

        if (itemOriginEffects.length === 0) return;
        
        console.log(`Actor (${actor.uuid}). Delete these effects:`, itemOriginEffects);
        const toDelete = itemOriginEffects.map(effect => effect.id as string);
        await actor.deleteEmbeddedDocuments('ActiveEffect', toDelete);
    }


    /**
     * Check if an effect originates from an owned item.
     * 
     * For more documentation check DeleteLocalItemOwnedEffects.
     * 
     * This method will only disable the effects instead of deleting them outright.
     * @param actor 
     * @returns updateData{effects}
     */
    static async DisableLocalItemOwnedEffects(actor: SR5Actor) {
        const itemOriginEffects = migrateEffects(actor);
        
        if (itemOriginEffects.length === 0) return {};

        console.log(`Actor (${actor.uuid}). Disable these effects:`, itemOriginEffects);
        const updateData = {effects: itemOriginEffects.map(effect => {
            // this migration might have run twice, therefore we remove a name prefix before readding :)
            return {_id: effect.id, disabled: true, name: `DISABLED: ${effect.name?.replace('DISABLED: ', '')}`};
        })};

        return updateData;
    }
}

/**
 * Inform users about migration changes and let them consent to deleting effects or opt-in to deleting effects only.
 */
class ConfigurationDialog extends FormDialog {
    constructor(data = {} as any) {
        data.templateData = {onlyDisableEffects: data.onlyDisableEffects};
        data.templatePath = `systems/shadowrun5e/dist/templates/apps/migrator/Version0.18.0.hbs`;
        data.title = Version0_18_0.TargetVersion;
        //@ts-expect-error
        super(data, {applyFormChangesOnSubmit: true});
    }
    
    override get buttons() {
        return {
            migrate: {
                label: game.i18n.localize('SR5.MIGRATION.BeginMigration'),
                icon: '<i class="fas fa-check"></i>'
            },
            cancel: {
                label: game.i18n.localize('SR5.Dialogs.Common.Cancel')
            }
        };
    } 
}

/**
 * Filter down all effects to only those to be migrated.
 * @param effects 
 * @param actor 
 * @returns 
 */
const migrateEffects = (actor: SR5Actor) => {
    return actor.effects.filter(effect => !!effect.origin && effect.origin.includes('.Item.'));
}