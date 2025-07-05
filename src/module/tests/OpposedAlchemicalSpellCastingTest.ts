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
    // The created spirit actors FoundryVTT uuid
    summonedSpiritUuid: string
}

/**
 * The opposed test of summoning a spirit.
 * 
 * The summoner is the active actor and the spirit is the opposed actor.
 */
export class OpposedAlchemicalSpellCastingTest extends OpposedTest<OpposedAlchemicalSpellCastingTestData> {
    public override against: AlchemicalSpellCastingTest

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

        data.preparationUuid = data.preparationUuid || '';

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
        // DTodo: Need to make sure this document gets cleaned up after a failure
        await this.createPreparation();

        // this.data.sourceActorUuid = this.data.summonedSpiritUuid || this.against.data.preparedSpiritUuid;

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
     * A failure for the spirit is a success for the summoner.
     */
    override async processFailure() {
        await this.updateSummonTestForFollowup();
        await this.finalizePreparation();
    }

    /**
     * A success of the spirit is a failure for the summoner.
     */
    override async processSuccess() {
        await this.updateSummonTestForFollowup();
        await this.cleanupAfterExecutionCancel();
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.PreparationFailure';
    }

    override get failureLabel(): Translation {
        return 'SR5.TestResults.PreparationSuccess';
    }

    async updateSummonTestForFollowup() {
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
        if (!this.actor) return;

        const summoner = this.against.actor as Actor;        

        const updateData = {
            'system.potency': this.derivePotency(),
            'system.alchemistUuid': summoner.uuid
        }

        this._addOwnershipToUpdateData(updateData);

        await this.actor.update(updateData);
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
     * Based on this tests selection, create a spirit actor
     */
    async createPreparation() {
        if (!this.against) return;
        if (!this.against.actor) return;

        const summoner = this.against.actor;

        console.log('What all info do we have access to here?', this.item);
        // Create a new preparation item from scratch...
        const preperationSpellName = this?.item?.name || '';
        const name = `${summoner.name} ${preperationSpellName} ${this.derivePotency()}`;
        const force = this.against.data.force;
        const system = { force };
        const itemData = {
            name: name,
            type: 'preparation'
        };

        const item = this.against.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
        // const actor = await Item.create({ name, type: 'spirit', system, prototypeToken: {actorLink: true} });

        if (!item) return console.error('Shadowrun 5e | Could not create the preparation');
    }

    /**
     * Try getting a prepared spirit actor to reuse.
     * 
     * @returns 
     */
    async getPreparedSpiritActor(): Promise<SR5Actor|null> {
        return await fromUuid(this.against.data.preparationUuid) as SR5Actor;
    }

    /**
     * Cleanup created actors that aren't needed anymore.
     * 
     * When user cancels the dialog, the spirits has been created. Remove it.
     */
    override async cleanupAfterExecutionCancel() {
        if (!this.against.data.preparationUuid) return;
        const item = await fromUuid(this.against.data.preparationUuid);
        await item?.delete();
        delete this.actor;
    }
}
