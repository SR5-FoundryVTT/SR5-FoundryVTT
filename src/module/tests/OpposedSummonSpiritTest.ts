import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { ModifiableValue } from '../mods/ModifiableValue';
import { ConjuringRules } from '../rules/ConjuringRules';
import { OpposedTest, OpposedTestData } from './OpposedTest';
import { SuccessTestData, TestDocuments, TestOptions } from './SuccessTest';
import { SummonSpiritTest } from './SummonSpiritTest';
import { Translation } from '../utils/strings';

const { setProperty, fromUuid } = foundry.utils;


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

    static async _resolveOpposedBootstrapDocument(
        againstData: SuccessTestData
    ): Promise<SR5Actor | SR5Item | null> {
        const sourceUuid = againstData.sourceActorUuid || againstData.sourceUuid || '';

        let document: unknown = sourceUuid ? await fromUuid(sourceUuid) : null;
        if (document instanceof TokenDocument)
            document = document.actor ?? null;

        if (document instanceof SR5Actor || document instanceof SR5Item)
            return document;

        return null;
    }

    static override async executeMessageAction(
        againstData: SuccessTestData,
        messageId: string,
        options: TestOptions
    ): Promise<void> {
        const bootstrapDocument = await this._resolveOpposedBootstrapDocument(againstData);
        if (!bootstrapDocument) {
            ui.notifications?.error('SR5.Errors.NoAvailableActorFound', { localize: true });
            return;
        }

        const data = await this._getOpposedActionTestData(againstData, bootstrapDocument, messageId);
        if (!data) return;

        const documents = { source: bootstrapDocument };
        const test = new this(data, documents, options);
        await test.execute();
    }

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
     * Resolve prepared spirit context without creating a new actor.
     */
    override async populateDocuments() {
        const preparedSpiritUuid = this.against.data.preparedSpiritUuid || '';
        this.data.sourceActorUuid = preparedSpiritUuid;
        this.data.sourceUuid = preparedSpiritUuid;

        await super.populateDocuments();
    }

    /**
     * Other than force there shouldn't be any other pool parts.
     */
    override applyPoolModifiers() {
        // NOTE: We don't have an actor, therefore don't need to call document modifiers.
        ModifiableValue.addUniqueBase(this.data.pool, 'SR5.Force', this.against.data.force);
    }

    /**
     * A failure for the spirit is a success for the summoner.
     */
    override async processFailure() {
        await this.updateSummonTestForFollowup();
        await this.createSummonedSpirit();
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
        if (this.against.preparedSpiritIsCompendium && !this.data.summonedSpiritUuid) return;
        if (!this.data.summonedSpiritUuid && !this.against.preparedSpiritIsEditable) return;

        const summoner = this.against.actor as SR5Actor;        

        const updateData = {
            system: {
                attributes: { force: { base: this.against.data.force } },
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

        if (!this.against.data.preparedSpiritUuid) return;

        const preparedActor = await this.getPreparedSpiritActor();
        if (!preparedActor) return console.error('Shadowrun 5e | Could not find prepared spirit actor');

        if (this.against.preparedSpiritIsCompendium) {
            if (!game.user.can('ACTOR_CREATE'))
                return ui.notifications.warn('SR5.Warnings.NoActorCreatePermission', { localize: true });

            const summonedName = `Summoned ${preparedActor.name}`;
            const preparedSource = game.actors.fromCompendium(preparedActor);

            preparedSource.name = summonedName;
            setProperty(preparedSource, 'prototypeToken.actorLink', true);

            const actor = await Actor.create(preparedSource);
            if (!actor) return console.error('Shadowrun 5e | Could not create the summoned spirit actor');

            this.data.summonedSpiritUuid = actor.uuid;
            this.data.sourceActorUuid = actor.uuid;
            this.data.sourceUuid = actor.uuid;
            this.actor = actor;
            return;
        }

        this.data.sourceActorUuid = preparedActor.uuid || '';
        this.data.sourceUuid = preparedActor.uuid || '';
        this.actor = preparedActor;
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
     */
    override async _cleanUpAfterDialogCancel() {
        if (!this.data.summonedSpiritUuid) return;
        const actor = await fromUuid<Actor>(this.data.summonedSpiritUuid);
        await actor?.delete();
        delete this.actor;
    }
}
