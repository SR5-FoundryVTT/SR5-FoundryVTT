import { SR5Actor } from "../../actor/SR5Actor";
import { FormDialog } from "../../apps/dialogs/FormDialog";
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

    // By default item effects will be deleted. should users want to keep them, they can 
    // only have them disabled and manually review / remove each.
    // TODO: During dev this will only disable. Change to false before release.
    private onlyDisableEffects = true;

    /**
     * Version 12 is introducing a breaking change with deleting effects.
     * 
     * Inform users about this and provide a less destructive option.
     */
    override async AskForUserConsentAndConfiguration() {
        const dialog = new ConfigurationDialog({onlyDisableEffects: this.onlyDisableEffects});
        await dialog.select();
        if (dialog.canceled) return false;

        console.error(this, dialog.data);

        // @ts-ignore
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
            await Version0_12_0.DeleteLocalItemOwnedEffects(actor);
            return {};
        }
        
        return Version0_12_0.DisableLocalItemOwnedEffects(actor);   
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
        const itemOriginEffects = actor.effects.filter(effect => effect.origin.includes('.Item.'));

        console.log(`Actor (${actor.uuid}). Delete these effects:`, itemOriginEffects);
        const toMigrate: string[] = [];
        for (const effect of itemOriginEffects) {            
            toMigrate.push(effect.id as string);
        }
        
        await actor.deleteEmbeddedDocuments('ActiveEffect', toMigrate);
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
        const itemOriginEffects = actor.effects
            //@ts-ignore TODO: foundry-vtt-types v10
            .filter(effect => effect.origin.includes('.Item.') && !effect.disabled);
        
        if (itemOriginEffects.length === 0) return {};

        const updateData = {effects: itemOriginEffects.map(effect => {
            return {_id: effect.id, disabled: true, name: `DISABLED: ${effect.name}`};
        })};

        return updateData;
    }
}



class ConfigurationDialog extends FormDialog {
    constructor(data = {} as any) {
        data.templateData = {onlyDisableEffects: data.onlyDisableEffects};
        data.templatePath = 'systems/shadowrun5e/dist/templates/apps/migrator/Version12.0.0.hbs';
        data.title = 'Version 12.0.0';
        //@ts-ignore
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