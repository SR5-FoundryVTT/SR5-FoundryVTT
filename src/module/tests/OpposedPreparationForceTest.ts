import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { ModifiableValue } from '../mods/ModifiableValue';
import { OpposedTest, OpposedTestData } from './OpposedTest';
import { SuccessTestData, TestDocuments, TestOptions } from './SuccessTest';
import { DeepPartial } from "fvtt-types/utils";
import { PreparationCreationTest } from './PreparationCreationTest';
import { Translation } from '../utils/strings';
import { spellPartKeys } from '../types/template/SpellPart';
import { AlchemyRules } from '../rules/AlchemyRules';

const { fromUuid } = foundry.utils;


interface OpposedPreparationForceTestData extends OpposedTestData {
    // The created preparation items FoundryVTT uuid
    preparationUuid: string
}

/**
 * The force of a preparation opposing its own creation, as described on SR5#305.
 *
 * The alchemist is the active actor. The opposition is the preparation's force alone, so this test
 * has no actor of its own. Whatever the outcome, drain is owed, so both results finalize the
 * creation test; only a failure of the force produces an actual preparation.
 */
export class OpposedPreparationForceTest extends OpposedTest<OpposedPreparationForceTestData> {
    declare against: PreparationCreationTest;

    /**
     * There is no opposing actor, so bootstrap from the alchemist instead of a target selection.
     */
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

    constructor(data: DeepPartial<OpposedPreparationForceTestData>, documents?: TestDocuments, options?: Partial<TestOptions>) {
        // The opposition is an abstract force, not an actor. Drop whatever actor the selection
        // supplied so no actor modifiers end up in the pool.
        delete documents?.actor;
        delete data.sourceActorUuid;

        super(data, documents, options);

        this._assertCorrectAgainst();
    }

    /**
     * Prohibit opposing any other test than PreparationCreationTest
     */
    _assertCorrectAgainst() {
        if (this.against.type !== 'PreparationCreationTest') throw new Error(`${this.constructor.name} can only oppose PreparationCreationTest but is opposing a ${this.against.type}`);
    }

    override _prepareData(data: DeepPartial<OpposedPreparationForceTestData>, options?: Partial<TestOptions>): OpposedPreparationForceTestData {
        const prepared = super._prepareData(data, options);

        prepared.preparationUuid ||= '';

        return prepared as OpposedPreparationForceTestData;
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/success-test-message.hbs'
    }

    /**
     * The drain of creating a preparation is owed by the alchemist, not by this test.
     */
    override get autoExecuteFollowupTest() {
        return false;
    }

    /**
     * Other than force there shouldn't be any other pool parts.
     */
    override applyPoolModifiers() {
        // NOTE: We don't have an actor, therefore don't need to call document modifiers.
        const pool = new ModifiableValue(this.data.pool);
        pool.remove('SR5.Force');
        pool.addBase('SR5.Force', this.against.data.force);
    }

    /**
     * A failure for the force is a success for the alchemist.
     */
    override async processFailure() {
        await this.updateCreationTestForFollowup();
        await this.createPreparationItem();
    }

    /**
     * A success for the force means no net hits and therefore no preparation, but the alchemist
     * still owes drain. SR5#305.
     */
    override async processSuccess() {
        await this.updateCreationTestForFollowup();
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.PreparationFailure';
    }

    override get failureLabel(): Translation {
        return 'SR5.TestResults.PreparationSuccess';
    }

    async updateCreationTestForFollowup() {
        // Finalize the original test values.
        this.against.calcDrain(this.hits.value);
        await this.against.saveToMessage();
    }

    /**
     * Create the preparation item on the alchemist, carrying a snapshot of the prepared spell.
     */
    async createPreparationItem() {
        const alchemist = this.against.actor;
        const spell = this.against.item;

        if (!alchemist || !spell) return;

        const potency = this.against.data.potency;
        if (potency <= 0) return;

        const spellSnapshot = {};
        for (const key of spellPartKeys) {
            spellSnapshot[key] = foundry.utils.duplicate(spell.system[key]);
        }

        // A preparation must retain the spell payload used by the defense/resistance chain. Do
        // not copy the spell's casting pool, limit, or modifiers: activation supplies its own
        // Force + Potency pool and Force limit.
        const actionSnapshot = {
            damage: foundry.utils.duplicate(spell.system.action.damage),
            opposed: foundry.utils.duplicate(spell.system.action.opposed),
        };

        const triggerTime = this.against.data.trigger === 'time'
            ? AlchemyRules.effectiveTriggerTime(
                Number(this.against.data.triggerTime),
                this.against.data.potency
            )
            : Math.max(Number(this.against.data.triggerTime), 0);

        const itemData = {
            name: `${spell.name} (${game.i18n.localize('SR5.ItemTypes.Preparation')})`,
            type: 'preparation' as const,
            img: spell.img,
            system: {
                ...spellSnapshot,
                description: foundry.utils.duplicate(spell.system.description),
                action: actionSnapshot,
                spellUuid: spell.uuid,
                force: this.against.data.force,
                trigger: this.against.data.trigger,
                // An overlong timer activates at the latest legal instant instead of silently
                // remaining armed past the chosen trigger's rules limit. SR5#305.
                triggerTime,
                potency: { base: potency, value: potency },
                created: { worldTime: game.time.worldTime },
                inert: false,
            }
        };

        const items = await alchemist.createEmbeddedDocuments('Item', [itemData]) as SR5Item[];
        const preparation = items?.[0];
        if (!preparation) return console.error('Shadowrun 5e | Could not create the preparation item');

        this.data.preparationUuid = preparation.uuid ?? '';
    }

    /**
     * Clean up a preparation that was created before the user cancelled out.
     */
    override async _cleanUpAfterDialogCancel() {
        if (!this.data.preparationUuid) return;
        const preparation = await fromUuid<Item>(this.data.preparationUuid);
        await preparation?.delete();
        this.data.preparationUuid = '';
    }
}
