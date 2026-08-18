import { GmOnlyMessageContentFlow } from '../../actor/flows/GmOnlyMessageContentFlow';
import { getItemScatterKind, getScatterLaunchAngle, getScatterOffset, resolveScatterRoll, ScatterKind, ScatterRollResult, ScatterRules } from '../../rules/ScatterRules';
import { SR5Roll } from '../../rolls/SR5Roll';
import { SpellCastingTest } from '../SpellCastingTest';
import { SuccessTest } from '../SuccessTest';
import { ThrownAttackTest } from '../ThrownAttackTest';

type ScatterTest = ThrownAttackTest | SpellCastingTest;

type ScatterMessageData = {
    title: string
    test: string
    directionRoll: SR5Roll
    distanceRoll: SR5Roll
    direction: number
    hits: number
    distance: number
    speaker: {
        source: SuccessTest['actor']
        token?: Token
    }
    item: SuccessTest['item']
};

/** Resolves SR5 grenade and indirect combat spell scatter after a failed test. */
export const BlastScatterFlow = {
    handledTests: new WeakSet<SuccessTest>(),

    /**
     * Will be called both after all success full tests and for post test template placements through chat message. 
     */
    async handle(test: SuccessTest): Promise<void> {
        // TODO: tamif/2005 Why do we need a set to track handled tests? 
        //      Is the same instance of an import used across references when using a const object?
        //      Should we use a class instead to avoid having to complicate things with sets...
        if (this.handledTests.has(test)) return;
        
        // Scatter only applies on failed tests. Allow action threshold configuration to apply
        // instead of a fixed hit amount check for grenades.
        if (test.success) return;

        // Scatter only applies for tests implementig a blastTemplateFlow.
        const scatterTest = test as ScatterTest;
        const blastTemplateFlow = scatterTest.blastTemplateFlow;
        const region = blastTemplateFlow?.placedRegion;
        if (!blastTemplateFlow || !region || !canvas.dimensions) return;

        this.handledTests.add(test);

        const kind = this.getScatterKind(test);
        if (!kind) return;

        const directionRoll = new SR5Roll(ScatterRules.scatterDiceFormula());
        const distanceRoll = new SR5Roll(ScatterRules.distanceDiceFormula(kind));
        await directionRoll.evaluate();
        await distanceRoll.evaluate();

        const direction = directionRoll.diceResults.reduce((total, value) => total + value, 0);
        const rolledDistance = distanceRoll.diceResults.reduce((total, value) => total + value, 0);
        const result = resolveScatterRoll(direction, rolledDistance, scatterTest.hits.value);
        if (!result) return;

        // await this.showDice(scatterTest, directionRoll);
        // await this.showDice(scatterTest, distanceRoll);

        await this.createMessage(
            scatterTest,
            kind,
            directionRoll,
            distanceRoll,
            result,
        );

        const offset = getScatterOffset(
            result,
            canvas.dimensions.distancePixels,
            this.getLaunchAngle(scatterTest, blastTemplateFlow),
        );
        await blastTemplateFlow.movePlacedRegion(offset);

    },

    getScatterKind(test: SuccessTest): ScatterKind | undefined {
        if (!(test instanceof ThrownAttackTest) && !(test instanceof SpellCastingTest)) return undefined;

        return getItemScatterKind(test.item);
    },

    getLaunchAngle(test: ScatterTest, blastTemplateFlow: ScatterTest['blastTemplateFlow']): number {
        const origin = blastTemplateFlow.placedRegionOrigin;
        if (!origin) return -Math.PI / 2;

        const source = test.actor?.getActiveTokens(true)[0];
        return getScatterLaunchAngle(origin, source?.center);
    },

    async createMessage(
        test: ScatterTest,
        kind: ScatterKind,
        directionRoll: SR5Roll,
        distanceRoll: SR5Roll,
        result: ScatterRollResult,
    ): Promise<ChatMessage | undefined> {
        const linkedTokens = test.actor?.getActiveTokens(true) || [];
        const content = await foundry.applications.handlebars.renderTemplate(
            'systems/shadowrun5e/dist/templates/chat/blast-scatter-message.hbs',
            {
                title: game.i18n.localize('SR5.Scatter.Title'),
                test: kind === 'grenade_standard' || kind === 'grenade_aerodynamic'
                    ? game.i18n.localize('SR5.Scatter.Grenade')
                    : game.i18n.localize('SR5.Scatter.Spell'),
                directionRoll,
                distanceRoll,
                direction: result.direction,
                hits: test.hits.value,
                distance: result.distance,
                speaker: {
                    source: test.actor,
                    token: linkedTokens.length >= 1 ? linkedTokens[0] : undefined,
                },
                item: test.item,
            } satisfies ScatterMessageData,
        );

        const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;
        const messageData = {
            user: game.user?.id,
            speaker: {
                actor: test.actor?.id,
                token,
                alias: game.user?.name,
            },
            rolls: [directionRoll, distanceRoll],
            content,
            sound: CONFIG.sounds.dice,
        } as ChatMessage.CreateData;

        ChatMessage.applyMode(messageData, test.data.options?.rollMode ?? game.settings.get('core', 'messageMode'));
        return ChatMessage.create(messageData);
    },

    async showDice(test: ScatterTest, roll: SR5Roll): Promise<void> {
        const dice3d = game.dice3d;
        if (!dice3d) return;

        let whisper: User[] | null = null;
        if (test.actor && GmOnlyMessageContentFlow.applyGmOnlyContent(test.actor)) {
            whisper = game.users.filter(user => test.actor?.testUserPermission(user, 'OWNER') === true);
        }

        const rollMode = test.data.options?.rollMode;
        if (rollMode === 'gm' || rollMode === 'blind') {
            whisper = [...game.users.filter(user => user.isGM), ...(whisper || [])];
        }

        await dice3d.showForRoll(
            roll,
            game.user,
            rollMode === 'public' || rollMode === 'ic',
            whisper,
            rollMode === 'blind'
        );
    },
};
