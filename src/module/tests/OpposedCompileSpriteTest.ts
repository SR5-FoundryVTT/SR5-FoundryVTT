import { SR5Actor } from "../actor/SR5Actor";
import { SR5 } from "../config";
import { PartsList } from "../parts/PartsList";
import { CompileSpriteTest } from "./CompileSpriteTest";
import { OpposedTest, OpposedTestData } from "./OpposedTest";
import { TestDocuments, TestOptions } from "./SuccessTest";
import { Translation } from '../utils/strings';


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
        return 'systems/shadowrun5e/dist/templates/rolls/opposed-actor-creator-message.html'
    }

    /**
     * When compiling the opposing sprite test triggers the FadeTest from compilation.
     * Since we can expect this test to be within GM context, we can't auto cast.
     */
    override get autoExecuteFollowupTest() {
        return false;
    }

    /**
     * To have an opposing actor, that's not on the map already, create the sprite actor.
     */
    override async populateDocuments() {
        await this.createCompiledSprite();

        this.data.sourceActorUuid = this.data.compiledSpriteUuid || this.against.data.preparedSpriteUuid;

        await super.populateDocuments();
    }

    /**
     * Other than force there shouldn't be any other pool parts.
     */
    override applyPoolModifiers() {
        // NOTE: We don't have an actor, therefore don't need to call document modifiers.
        PartsList.AddUniquePart(this.data.pool.mod, 'SR5.Level', this.against.data.level);
    }

    /**
     * A failure for the sprite is a success for the summoner.
     */
    override async processFailure() {
        await this.updateCompilationTestForFollowup();
        await this.finalizeSummonedSprite();
    }

    /**
     * A success of the sprite is a failure for the summoner.
     */
    override async processSuccess() {
        await this.updateCompilationTestForFollowup();
        await this.cleanupAfterExecutionCancel();
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
    override async cleanupAfterExecutionCancel() {
        if (!this.data.compiledSpriteUuid) return;
        const actor = await fromUuid(this.data.compiledSpriteUuid);
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
    async finalizeSummonedSprite() {
        if (!this.actor) return;

        const technomancer = this.against.actor!;

        const updateData = {
            // 'system.services': this.deriveSpriteServices(),
            system: { technomancerUuid: technomancer.uuid }
        }

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

        const technomancer = this.against.actor;

        if (this.against.data.preparedSpriteUuid) {
            // Reuse a prepared actor...
            const preparedActor = await this.getPreparedSpriteActor();
            if (!preparedActor) return console.error('Shadowrun 5e | Could not find prepared actor');
            await preparedActor.addTechnomancer(technomancer);
            console.error('Add compiler/mancer? reference to sprite');

        } else {
            // Create a new sprite actor from scratch...
            const spriteType = this.against.data.spriteTypeSelected;
            const spriteTypeLabel = game.i18n.localize(SR5.spriteTypes[spriteType]);
            const name = `${technomancer.name} ${spriteTypeLabel} ${game.i18n.localize('TYPES.Actor.sprite')}`;
            const level = this.against.data.level;
            const system = { level, spriteType };

            const actor = await Actor.create({ name, type: 'sprite', system, prototypeToken: { actorLink: true } });

            if (!actor) return console.error('Shadowrun 5e | Could not create the compiled sprite actor');

            this.data.compiledSpriteUuid = actor.uuid;
        }
    }

    /**
     * Try getting a prepared sprite actor to reuse.
     * 
     * @returns 
     */
    async getPreparedSpriteActor(): Promise<SR5Actor | null> {
        return await fromUuid(this.data.compiledSpriteUuid as string) as SR5Actor;
    }
}
