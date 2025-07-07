import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { SR5 } from '../config';
import { PartsList } from '../parts/PartsList';
import { OpposedTest, OpposedTestData } from './OpposedTest';
import { TestDocuments, TestOptions } from './SuccessTest';
import { AlchemicalSpellCastingTest } from './AlchemicalSpellCastingTest';
import { Translation } from '../utils/strings';
import { AlchemicalSpellCastingRules } from '../rules/AlchemicalSpellCastingRules';


interface OpposedAlchemicalSpellCastingTestData extends OpposedTestData {

}

/**
 * The opposed test of summoning a spirit.
 * 
 * The summoner is the active actor and the spirit is the opposed actor.
 */
export class OpposedAlchemicalSpellCastingTest extends OpposedTest<OpposedAlchemicalSpellCastingTestData> {
    public override against: AlchemicalSpellCastingTest;
    public preparation: any;

    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        // Due to summoning, the active actor for this test will be created during execution.
        // The selected or user character aren't the correct choice here.
        delete documents?.actor;
        delete data.sourceActorUuid;

        super(data, documents, options);       

        this._assertCorrectAgainst();
    }

    /**
     * Prohibit opposing any other test than AlchemicalSpellCastingTest
     */
    _assertCorrectAgainst() {
        if (this.against.type !== 'AlchemicalSpellCastingTest') throw new Error(`${this.constructor.name} can only oppose AlchemicalSpellCastingTest but is opposing a ${this.against.type}`);
    }

    override _prepareData(data: any, options?: any) {
        data = super._prepareData(data, options);

        return data;
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/opposed-preparation-creator-message.html'
    }

    /**
     * When summoning the opposing spirit test triggers the DrainTest from summoning.
     * Since we can expect this test to be within GM context, we can't auto cast DrainTest.
     */
    override get autoExecuteFollowupTest() {
        return false;
    }

    /**
     * To have an opposing actor, that's not on the map already, create the spirit actor.
     */
    override async populateDocuments() {
        await super.populateDocuments();
    }

    /**
     * Other than force there shouldn't be any other pool parts.
     */
    override applyPoolModifiers() {
        // NOTE: We don't have an actor, therefore don't need to call document modifiers.
        PartsList.AddUniquePart(this.data.pool.mod, 'SR5.Force', this.against.data.force);
    }

    /**
     * A failure for the preparation is a success for the alchemist.
     */
    override async processFailure() {
        await this.updateAlchemySpellCastingTestForFollowup();
        await this.finalizePreparation();
    }

    /**
     * A success of the preparation is a failure for the alchemist.
     */
    override async processSuccess() {
        await this.updateAlchemySpellCastingTestForFollowup();
        // await this.cleanupAfterExecutionCancel();
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.PreparationFailure';
    }

    override get failureLabel(): Translation {
        return 'SR5.TestResults.PreparationSuccess';
    }

    async updateAlchemySpellCastingTestForFollowup() {
        // Finalize the original test values.
        await this.against.saveToMessage();
    }

    /**
     * Derive the amount of potency the created preparation will have.
     * 
     * Should be called after a successful enchanting.
     */
    derivePotency() {
        return AlchemicalSpellCastingRules.potency(this.against.hits.value, this.hits.value);
    }

    /**
     * Finalize the existing spirit actor with context around it's summoning.
     * 
     * This should be called as the last step in summoning.
     */
    async finalizePreparation() {
        if (!this.item) return;

        await this.createPreparation();

        await super.populateDocuments();
    }

    /**
     * Give all users with the summoning actor permissions of the created spirit actor.
     * 
     * @param updateData The update data to add the permission to, that's applied to the spirit actor. 
     */
    _addOwnershipToUpdateData(updateData: object) {
        const alchemist = this.against.actor as Actor;

        // Set permissions for all users using the summoner as main character.
        const users = game.users?.filter(user => user.character?.uuid === alchemist.uuid);
        if (!users) return;

        const ownership = {};
        users.forEach(user => {
            if (user.isGM) return;
            // #TODO: Add a setting to define that this should be done and what permission it should be done with.
            //@ts-expect-error v10
            ownership[user.id] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
        })
        updateData['ownership'] = ownership
    }

    /**
     * Based on this tests selection, create a preparation item
     */
    async createPreparation() {
        if (!this.against) return;
        if (!this.against.actor) return;
        if (!this.against.item) return;

        const summoner = this.against.actor;

        // Create a new preparation item from scratch...
        const preperationSpellName = this?.item?.name || '';
        const force = this.against.data.force;
        const name = `${summoner.name} ${preperationSpellName} - ${game.i18n.localize('SR5.Force')}  ${force}`;
        const system = {
            category: this.against.item.system.category,
            drain: this.against.item.system.drain,
            duration: this.against.item.system.duration,
            potency: this.derivePotency(),
            force: force,
            trigger: this.against.data.trigger,
            type: this.against.item.system.type,

            combat: this.against.item.system.combat,
            detection: this.against.item.system.detection,
            illusion: this.against.item.system.illusion,
            manipulation: this.against.item.system.manipulation
        }
        const itemData = {
            name: name,
            type: 'preparation',
            system: system
        };

        const item = (await this.against.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true }))[0];
        console.log('So what is in this item?', item)
        this.preparation = item;
        if (!item) return console.error('Shadowrun 5e | Could not create the preparation');
    }
}
