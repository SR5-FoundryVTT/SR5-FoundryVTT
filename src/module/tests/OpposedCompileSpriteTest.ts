import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { ModifiableValue } from "../mods/ModifiableValue";
import { CompileSpriteTest } from "./CompileSpriteTest";
import { OpposedTest, OpposedTestData } from "./OpposedTest";
import { SuccessTestData, TestDocuments, TestOptions } from "./SuccessTest";
import { Translation } from '../utils/strings';

const { setProperty, fromUuid } = foundry.utils;


interface OpposedCompileSpriteTestData extends OpposedTestData {
    compiledSpriteUuid: string
}

/**
 * Handle the flow of opposing a compilation test by the compiled sprite.
 * 
 * The technomancer is the active actor and the sprite the opposed actor.
 */
export class OpposedCompileSpriteTest extends OpposedTest<OpposedCompileSpriteTestData> {
    declare public against: CompileSpriteTest;

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
        // Due to compilation, the active actor for this test will be created during execution.
        // The selected or user character aren't the correct choice here.
        delete documents?.actor;
        delete data.sourceActorUuid;

        super(data, documents, options);

        this._assertCorrectAgainst();
    }

    _assertCorrectAgainst() {
        if (this.against.type !== 'CompileSpriteTest') throw new Error(`${this.constructor.name} can only oppose CompileSpriteTest but is opposing a ${this.against.type}`);
    }

    override _prepareData(data: any, options?: any) {
        data = super._prepareData(data, options);

        data.compiledSpriteUuid = data.compiledSpriteUuid || '';

        return data;
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/opposed-actor-creator-message.hbs'
    }

    /**
     * When compiling the opposing sprite test triggers the FadeTest from compilation.
     * Since we can expect this test to be within GM context, we can't auto cast.
     */
    override get autoExecuteFollowupTest() {
        return false;
    }

    /**
     * Resolve prepared sprite context without creating a new actor.
     */
    override async populateDocuments() {
        const preparedSpriteUuid = this.against.data.preparedSpriteUuid || '';
        this.data.sourceActorUuid = preparedSpriteUuid;
        this.data.sourceUuid = preparedSpriteUuid;

        await super.populateDocuments();
    }

    /**
     * Other than force there shouldn't be any other pool parts.
     */
    override applyPoolModifiers() {
        // NOTE: We don't have an actor, therefore don't need to call document modifiers.
        ModifiableValue.addUniqueBase(this.data.pool, 'SR5.Level', this.against.data.level);
    }

    /**
     * A failure for the sprite is a success for the summoner.
     */
    override async processFailure() {
        await this.updateCompilationTestForFollowup();
        await this.createCompiledSprite();
        await this.finalizeCompiledSprite();
    }

    /**
     * A success of the sprite is a failure for the summoner.
     */
    override async processSuccess() {
        await this.updateCompilationTestForFollowup();
        await this._cleanUpAfterDialogCancel();
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.SpriteCompilationFailure';
    }

    override get failureLabel(): Translation {
        return 'SR5.TestResults.SpriteCompilationSuccess';
    }

    /**
     * Cleanup created actors that aren't needed anymore.
     * 
     * When user cancels the dialog, the sprite has been created. Remove it.
     */
    override async _cleanUpAfterDialogCancel() {
        if (!this.data.compiledSpriteUuid) return;
        const actor = await fromUuid(this.data.compiledSpriteUuid) as SR5Actor;
        await actor?.delete();
        delete this.actor;
    }


    /**
     * Update the triggering test to be ready for the followup fade test.
     */
    async updateCompilationTestForFollowup() {
        // Finalize the original test values.
        this.against.calcFade(this.hits.value);
        await this.against.saveToMessage();
    }

    /**
     * Finalize the existing sprite actor with context around it's summoning.
     * 
     * This should be called as the last step in summoning.
     */
    async finalizeCompiledSprite() {
        if (!this.actor) return;
        if (this.against.preparedSpriteIsCompendium && !this.data.compiledSpriteUuid) return;
        if (!this.data.compiledSpriteUuid && !this.against.preparedSpriteIsEditable) return;

        const technomancer = this.against.actor as SR5Actor;

        const updateData = {
            // 'system.services': this.deriveSpriteServices(),
            system: { technomancerUuid: technomancer.uuid }
        };

        this._addOwnershipToUpdateData(updateData);

        await this.actor.update(updateData);
    }

    /**
     * Give all users with the summoning actor permissions of the created sprite actor.
     * 
     * TODO: Doesn't adhere to naive DRY with OpposedSummonSpiritTest.
     * 
     * @param updateData The update data to add the permission to, that's applied to the sprite actor. 
     */
    _addOwnershipToUpdateData(updateData: object) {
        const summoner = this.against.actor!;

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
     * Based on this tests selection, create a sprite actor
     */
    async createCompiledSprite() {
        if (!this.against) return;
        if (!this.against.actor) return;

        if (!this.against.data.preparedSpriteUuid) return;

        const preparedActor = await this.getPreparedSpriteActor();
        if (!preparedActor) return console.error('Shadowrun 5e | Could not find prepared sprite actor');

        if (this.against.preparedSpriteIsCompendium) {
            if (!game.user.can('ACTOR_CREATE'))
                return ui.notifications.warn('SR5.Warnings.NoActorCreatePermission', { localize: true });

            const compiledName = `Compiled ${preparedActor.name}`;
            const preparedSource = game.actors.fromCompendium(preparedActor);

            preparedSource.name = compiledName;
            setProperty(preparedSource, 'prototypeToken.actorLink', true);

            const actor = await Actor.create(preparedSource);
            if (!actor) return console.error('Shadowrun 5e | Could not create the compiled sprite actor');

            this.data.compiledSpriteUuid = actor.uuid;
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
     * Try getting a prepared sprite actor to reuse.
     * 
     * @returns 
     */
    async getPreparedSpriteActor(): Promise<SR5Actor | null> {
        return fromUuid<SR5Actor>(this.against.data.preparedSpriteUuid);
    }
}
