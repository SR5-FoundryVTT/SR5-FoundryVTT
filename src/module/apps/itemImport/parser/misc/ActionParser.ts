import { Parser } from "../Parser";
import { SR5 } from "@/module/config";
import { Action } from "../../schema/ActionsSchema";
import { TestCreator } from "@/module/tests/TestCreator";
import { ActionRollType } from "@/module/types/item/Action";
import { ImportHelper as IH } from "../../helper/ImportHelper";
import { CompendiumKey, Constants } from "../../importer/Constants";

// Define constants to avoid "magic strings"
const DICE_POOL_SEPARATOR = 'v.';
const ACTION_PREFIX = "Action:";
const THRESHOLD_PREFIX = "Threshold:";

export class ActionParser extends Parser<'action'> {
    protected readonly parseType = 'action';

    private readonly attrs = Object.keys(SR5.attributes) as (keyof typeof SR5.attributes)[];
    private readonly limits = Object.keys(SR5.limits) as (keyof typeof SR5.limits)[];
    private readonly skills = Object.keys(SR5.activeSkills) as (keyof typeof SR5.activeSkills)[];
    private storedActions: Record<string, ActionRollType> = {};

    protected override getSystem(jsonData: Action) {
        const system = this.getBaseSystem();
        const { action, description } = system;

        // 1. Set basic action properties
        action.type = jsonData.type._TEXT.toLowerCase();
        action.extended = jsonData.type._TEXT === "Extended";
        description.value = jsonData.test?.bonusstring?._TEXT ?? "";

        // 2. Parse the test dice pools if they exist
        if (jsonData.test) {
            const [dicePoolStr, opposedDicePoolStr] = jsonData.test.dice._TEXT.split(DICE_POOL_SEPARATOR);
            this.parseDicePool(system, action, dicePoolStr);
            if (opposedDicePoolStr)
                this.parseOpposedPool(system, action, opposedDicePoolStr);

            if (jsonData.test.limit?._TEXT) {
                const limit = IH.formatAsSlug(jsonData.test.limit._TEXT).replaceAll("-", "_");
                action.limit.attribute = this.limits.find(l => limit.includes(l)) || "";
            }
        }

        // 3. Determine the specific test type based on various conditions
        this.setTestAction(action, jsonData);

        if (jsonData.test?.bonusstring?._TEXT)
            this.handleSpecial(action, jsonData.test.bonusstring._TEXT);

        // 4. Store the parsed action for potential reuse by other actions
        this.storedActions[jsonData.name._TEXT] = action;
        return system;
    }

    private handleSpecial(action: ActionRollType, bonusstring: string) {
        const marks = Number(bonusstring.match(/Requires\s+(\d+)\s+marks?/i)?.[1]);
        if (marks)
            action.category.matrix.marks = marks;

        if (bonusstring.includes("resist {Icon: Attack}")) {
            action.damage.type.base = "matrix";
            action.damage.attribute = "attack";

            action.opposed.resist.test = "MatrixDefenseTest";

            if (bonusstring.toLowerCase().includes("biofeedback")) {
                action.opposed.resist.test = "BiofeedbackResistTest";

                if (bonusstring.toLowerCase().includes("stun"))
                    action.damage.biofeedback = "stun";
            }
        }

        if (bonusstring.toLowerCase().includes("resist fading"))
            action.followed.test = "FadeTest";
    }

    /**
     * Parses a dice pool string and applies its components (attributes, skill, modifier) to a target object.
     */
    private parseDicePool(
        system: ReturnType<typeof this.getBaseSystem>,
        target: ActionRollType | ActionRollType['opposed'],
        dicePoolStr: string
    ) {
        if (dicePoolStr === 'None') return;

        const components = [...dicePoolStr.matchAll(/\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g)].map(m => m[1]);

        // Handle references to other actions
        if (components[0]?.includes(ACTION_PREFIX) || this.storedActions[components[0]]) {
            const actionName = components[0].replace(ACTION_PREFIX, "").trim();
            const otherAction = this.storedActions[actionName];
            if (otherAction) {
                foundry.utils.mergeObject(target, otherAction, { insertKeys: false, insertValues: false });
            } else {
                console.warn(`Action reference not found: ${actionName}`);
            }
            return;
        }

        // Parse attributes and skill
        if (components[0]) target.attribute  = Constants.attributeTable[components[0]];
        if (components[1]) target.attribute2 = Constants.attributeTable[components[1]];

        if (dicePoolStr.trim() === "2 * {Icon: Rating}") {
            target.attribute = "rating";
            target.attribute2 = "rating";
        }

        if (components[0] && !target.attribute) {
            const attrSlug = IH.formatAsSlug(components[0]).replaceAll("-", "_");
            target.attribute = this.attrs.find(a => attrSlug.includes(a)) || "";
        }

        if (components[1] && !target.attribute2) {
            const attrSlug = IH.formatAsSlug(components[1]).replaceAll("-", "_");
            target.attribute2 = this.attrs.find(a => attrSlug.includes(a)) || "";
        }

        if (components[1] && !target.attribute2){
            const skillSlug = IH.formatAsSlug(components[1]).replaceAll("-", "_");
            target.skill = this.skills.find(s => skillSlug.includes(s)) || "";
        }

        if (!isNaN(Number(components[0])))
            target.mod = Number(components[0]);

        // Parse constant modifier
        const modifier = [...dicePoolStr.replace("2 *", "").matchAll(/([+-]?\s*\d+)/g)]
            .map(m => Number(m[1].replaceAll(/\s+/g, "")))
            .reduce((acc, curr) => acc + curr, 0);

        if (modifier)
            target.mod += modifier;

        if (!target.attribute || !(target.attribute2 || target.skill)) {
            if (!target.attribute && components[0])
                this.addException(system.description, components[0]);
            if (!(target.attribute2 || target.skill) && components[1])
                this.addException(system.description, components[1]);
        }

        for (const comp of components.slice(2))
            this.addException(system.description, comp);
    }

    private addException(
        description: ReturnType<typeof this.getBaseSystem>['description'],
        exception: string
    ) {
        if (exception.includes("Improvement Value:")) return;
        description.value += `\n\n[Cannot automate pool: {${exception}}]`;
    }

    /**
     * Parses the opposed part of a test string.
     */
    private parseOpposedPool(
        system: ReturnType<typeof this.getBaseSystem>,
        action: ActionRollType,
        opposedDicePoolStr: string
    ) {
        const components = [...opposedDicePoolStr.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
        const { opposed, threshold } = action;

        action.opposed.test = "OpposedTest";

        if (components[0]?.includes(THRESHOLD_PREFIX)) {
            threshold.base = Number(components[0].replace(THRESHOLD_PREFIX, "").trim()) || 0;
        } else {
            // If it's not a threshold, it's a standard opposed dice pool
            this.parseDicePool(system, opposed, opposedDicePoolStr);
        }
    }

    /**
     * Sets the final 'test' property on the action based on its name, category, or skill.
     */
    private setTestAction(action: ActionRollType, jsonData: Action) {
        const name = jsonData.name._TEXT;
        const category = jsonData.category?._TEXT;

        // Use a mapping for simple name-to-test assignments
        const testMap: Record<string, string> = {
            "Melee Attack": "MeleeAttackTest",
            "Melee Defense": "PhysicalDefenseTest",
            "Ranged Defense": "PhysicalDefenseTest",
            "Suppressive Fire Defense": "PhysicalDefenseTest",
            "Use Skill": "SkillTest",
        };

        if (name.includes("Reckless Spellcasting")) {
            action.followed.mod = 3;
        }

        if (testMap[name]) {
            action.test = testMap[name];
        } else if (name.includes("Spell Defense")) {
            action.test = "CombatSpellDefenseTest";
        } else if (action.skill === "spellcasting") {
            action.test = "SpellCastingTest";
            action.followed.test = "DrainTest";
        } else if (name.includes("Brute Force")) {
            action.test = "BruteForceTest";
            action.opposed.test = "OpposedBruteForceTest";
        } else if (name.includes("Hack on the Fly")) {
            action.test = "HackOnTheFlyTest";
            action.opposed.test = "OpposedHackOnTheFlyTest";
        } else if (action.skill === "throwing_weapon") {
            action.test = "ThrownAttackTest";
        } else if (action.skill === "summoning") {
            action.test = "SummonSpiritTest";
            action.followed.test = "DrainTest";
            action.opposed.test = "OpposedSummonSpiritTest";
        } else if (action.skill === "compiling") {
            action.test = "CompileSpriteTest";
            action.followed.test = "FadeTest";
            action.opposed.test = "OpposedCompileSpriteTest";
        }else if (jsonData.test?.dice._TEXT.includes("Ranged Defense")) {
            action.test = "RangedAttackTest";
        } else if (category === "Matrix" && name.includes("Defense")) {
            action.test = "MatrixDefenseTest";
        } else if (category === "Matrix" || action.opposed.test === "MatrixDefenseTest") {
            action.test = "MatrixTest";
            if (action.test === "MatrixTest" && action.opposed.test === "OpposedTest")
                action.opposed.test = "MatrixDefenseTest";
        }

        const cls = TestCreator._getTestClass(action.test);
        if (cls) {
            try {
                const testCls = new cls(TestCreator._minimalTestData());
                action.categories = testCls.testCategories;
                action.modifiers = testCls.testModifiers;
            } catch (error) {
                console.error("Error creating test class:", error);
            }
        }
    }

    protected override async getFolder(jsonData: Action, compendiumKey: CompendiumKey): Promise<Folder> {
        const matrix = this.storedActions[jsonData.name._TEXT]?.test?.includes("Matrix");
        const matrixLabel = game.i18n.localize("SR5.Labels.ActorSheet.Matrix");
        const rootFolder = game.i18n.localize("TYPES.Item.action") + (matrix ? ` (${matrixLabel})` : "");
        const subFolder = jsonData.type?._TEXT || "Unknown";
        return IH.getFolder(compendiumKey, rootFolder, subFolder);
    }
}
