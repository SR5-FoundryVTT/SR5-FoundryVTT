import { SR5Actor } from '../actor/SR5Actor';
import { SR5 } from '../config';
import { PartsList } from '../parts/PartsList';
import { ConjuringRules } from '../rules/ConjuringRules';
import { OpposedTest, OpposedTestData } from './OpposedTest';
import { TestDocuments, TestOptions } from './SuccessTest';
import { SummonSpiritTest } from './SummonSpiritTest';
import { Translation } from '../utils/strings';


interface OpposedSummonSpiritTestData extends OpposedTestData {
    // The created spirit actors FoundryVTT uuid
    summonedSpiritUuid: string
}

/**
 * The opposed test of summoning a spirit.
 * 
 * The summoner is the active actor and the spirit is the opposed actor.
 */
export class OpposedSummonSpiritTest extends OpposedTest<OpposedSummonSpiritTestData> {
    declare against: SummonSpiritTest;

    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        // Due to summoning, the active actor for this test will be created during execution.
        // The selected or user character aren't the correct choice here.
        delete documents?.actor;
        delete data.sourceActorUuid;

        super(data, documents, options);       

        this._assertCorrectAgainst();
    }

    /**
     * Prohibit opposing any other test than SummonSpiritTest
     */
    _assertCorrectAgainst() {
        if (this.against.type !== 'SummonSpiritTest') throw new Error(`${this.constructor.name} can only oppose SummonSpiritTest but is opposing a ${this.against.type}`);
    }

    override _prepareData(data: any, options?: any) {
        data = super._prepareData(data, options);

        data.summonedSpiritUuid = data.summonedSpiritUuid || '';

        return data;
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/opposed-actor-creator-message.hbs'
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
        await this.createSummonedSpirit();

        this.data.sourceActorUuid = this.data.summonedSpiritUuid || this.against.data.preparedSpiritUuid;

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
        await this.finalizeSummonedSpirit();
    }

    /**
     * A success of the spirit is a failure for the summoner.
     */
    override async processSuccess() {
        await this.updateSummonTestForFollowup();
        await this._cleanUpAfterDialogCancel();
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.SpiritSummonFailure';
    }

    override get failureLabel(): Translation {
        return 'SR5.TestResults.SpiritSummonSuccess';
    }

    async updateSummonTestForFollowup() {
        // Finalize the original test values.
        this.against.calcDrain(this.hits.value);
        await this.against.saveToMessage();
    }

    /**
     * Derive the amount of services the created actor spirit will have.
     * 
     * Should be called after a successful summoning.
     */
    deriveSpiritServices() {
        return ConjuringRules.spiritServices(this.against.hits.value, this.hits.value);
    }

    /**
     * Finalize the existing spirit actor with context around it's summoning.
     * 
     * This should be called as the last step in summoning.
     */
    async finalizeSummonedSpirit() {
        if (!this.actor) return;

        const summoner = this.against.actor as SR5Actor;        

        const updateData = {
            system: {
                services: this.deriveSpiritServices(),
                summonerUuid: summoner.uuid
            }
        };

        this._addOwnershipToUpdateData(updateData);

        await this.actor.update(updateData);
    }

    /**
     * Give all users with the summoning actor permissions of the created spirit actor.
     * 
     * @param updateData The update data to add the permission to, that's applied to the spirit actor. 
     */
    _addOwnershipToUpdateData(updateData: object) {
        const summoner = this.against.actor as SR5Actor;

        // Set permissions for all users using the summoner as main character.
        const users = game.users?.filter(user => user.character?.uuid === summoner.uuid);
        if (!users) return;

        const ownership = {};
        users.forEach(user => {
            if (user.isGM) return;
            // #TODO: Add a setting to define that this should be done and what permission it should be done with.
            ownership[user.id] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
        })
        updateData['ownership'] = ownership
    }

    /**
     * Based on this tests selection, create a spirit actor
     */
    async createSummonedSpirit() {
        if (!this.against) return;
        if (!this.against.actor) return;

        const summoner = this.against.actor;

        if (this.against.data.preparedSpiritUuid) {
            // Reuse a prepared actor...
            const preparedActor = await this.getPreparedSpiritActor();
            if (!preparedActor) return console.error('Shadowrun 5e | Could not find prepared spirit actor');
            await preparedActor.update({ system: { summonerUuid: summoner.uuid } });
            
        } else {
            // Create a new spirit actor from scratch...
            const spiritType = this.against.data.spiritTypeSelected as any;
            const spiritTypeLabel = game.i18n.localize(SR5.spiritTypes[spiritType]);
            const name = `${summoner.name} ${spiritTypeLabel} ${game.i18n.localize('TYPES.Actor.spirit')}`;
            const force = this.against.data.force;
            const system = { force, spiritType };
    
            const actor = await Actor.create({ name, type: 'spirit', system, prototypeToken: {actorLink: true} });
    
            if (!actor) return console.error('Shadowrun 5e | Could not create the summoned spirit actor');
    
            this.data.summonedSpiritUuid = actor.uuid;
        }
    }

    /**
     * Try getting a prepared spirit actor to reuse.
     * 
     * @returns 
     */
    async getPreparedSpiritActor(): Promise<SR5Actor|null> {
        return fromUuid(this.against.data.preparedSpiritUuid) as Promise<SR5Actor>;
    }

    /**
     * Cleanup created actors that aren't needed anymore.
     * 
     * When user cancels the dialog, the spirits has been created. Remove it.
     */
    override async _cleanUpAfterDialogCancel() {
        if (!this.data.summonedSpiritUuid) return;
        const actor = await fromUuid(this.data.summonedSpiritUuid as any) as SR5Actor | null;
        await actor?.delete();
        delete this.actor;
    }
}
