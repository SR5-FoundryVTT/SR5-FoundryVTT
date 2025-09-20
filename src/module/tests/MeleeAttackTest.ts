import { SuccessTest, SuccessTestData } from "./SuccessTest";
import { DataDefaults } from "../data/DataDefaults";
import { SR5Actor } from "../actor/SR5Actor";
import ModifierTypes = Shadowrun.ModifierTypes;

export interface MeleeAttackData extends SuccessTestData {
    reach: number
}

export class MeleeAttackTest extends SuccessTest<MeleeAttackData> {

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.damage = data.damage || DataDefaults.createData('damage');

        return data;
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['attack', 'attack_melee'];
    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'environmental'];
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/melee-attack-test-dialog.hbs';
    }

    override get showSuccessLabel(): boolean {
        return this.success;
    }

    override async prepareDocumentData() {
        if (!this.item || !this.item.isMeleeWeapon()) return;

        this.data.reach = this.item.getReach();
        this.data.reach += this.actor && 'reach' in this.actor.system.modifiers ? this.actor?.system.modifiers.reach : 0;

        await super.prepareDocumentData();
    }

    /**
     * Remove unneeded environmental modifier categories for melee tests.
     * 
     * See SR5#187 'Environmental Modifiers'
     * 
     * @param actor 
     * @param type 
     */
    override prepareActorModifier(actor: SR5Actor, type: ModifierTypes): { name: string; value: number; } {
        if (type !== 'environmental') return super.prepareActorModifier(actor, type);

        // Only light and visibility apply.
        const modifiers = actor.getSituationModifiers();
        modifiers.environmental.apply({ applicable: ['light', 'visibility'] });

        const name = this._getModifierTypeLabel(type);
        const value = modifiers.environmental.total;

        return { name, value };
    }

    /**
     * Some Melee Weapons have ammo and can consume it.
     */
    override canConsumeDocumentResources(): boolean {
        if (this.item === undefined) return true;
        if (!this.item.usesAmmo()) return true;

        // Consume one ammo per attack.
        if (!this.item.hasAmmo(1)) {
            ui.notifications?.error('SR5.MissingRessource.SomeAmmoMelee', {localize: true});
            return false;
        }

        return super.canConsumeDocumentResources();
    }

    /**
     * Some Melee Weapons can consume ammo resources.
     */
    override async consumeDocumentRessources(): Promise<boolean> {
        if (!await super.consumeDocumentRessources()) return false;
        if (!await this.consumeWeaponAmmo()) return false;

        return true;
    }

    /**
     * Reduce the melee weapon ammunition for this attack.
     */
    async consumeWeaponAmmo(): Promise<boolean> {  
        if (this.item === undefined) return true;
        if (!this.item.usesAmmo()) return true;

        // Notify user about some but not no ammo. Still let them punch though.
        if (!this.item.hasAmmo(1)) {
            ui.notifications?.warn('SR5.MissingRessource.SomeAmmoMelee', {localize: true});
        }

        await this.item.useAmmo(1);

        return true;
    }
}
