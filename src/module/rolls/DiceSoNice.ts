import { SR5Die } from "./SR5Die";

type DiceSoNiceDieType = `d${string}`;

export type DiceSoNicePreset = {
    type: DiceSoNiceDieType,
    labels: string[],
    system: string,
    colorset?: string,
    font?: string,
    fontScale?: number | Record<string, number>,
    bumpMaps?: string[],
    values?: { min: number, max: number, step?: number },
    emissiveMaps?: string[],
    emissive?: string | number,
    emissiveIntensity?: number,
    atlas?: string,
    backgrounds?: {
        labels?: string[],
        bumpMaps?: string[],
        emissiveMaps?: string[],
    },
    labelScale?: number,
    modelFile?: string,
    scaleModifier?: number,
    valueMap?: Record<string | number, number>,
};

export type DiceSoNiceSystem = {
    dice: Map<DiceSoNiceDieType, DiceSoNicePreset>
};

/*
 * Interface to interact with Dice So Nice module.
 * https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/Integration
 */
export interface DiceSoNice {
    /**
     * Show the 3D Dice animation for the Roll made by the User.
     *
     * @param roll an instance of Roll class to show 3D dice animation.
     * @param user the user who made the roll (game.user by default).
     * @param synchronize if the animation needs to be sent and played for each players (true/false).
     * @param whisper list of users or userIds who can see the roll, leave it empty if everyone can see.
     * @param blind if the roll is blind for the current user
     * @param messageID ChatMessage related to this roll (default: null)
     * @param speaker Object based on the ChatSpeakerData data schema related to this roll. Useful to fully support DsN settings like "hide npc rolls". (Default: null)
     * @param options Object with 2 booleans: ghost (default: false) and secret (default: false)
     * @returns {Promise<boolean>} when resolved true if the animation was displayed, false if not.
     */
    showForRoll: (
        roll: Roll,
        user: User,
        synchronize: boolean,
        whisper: User[] | string[] | null,
        blind: boolean,
        messageID?: string | null,
        speaker?: foundry.documents.ChatMessage.SpeakerData | null,
        options?: { ghost?: boolean, secret?: boolean }
    ) => Promise<boolean>;

    /**
     * Register a new dice preset.
     * 
     * The dice parameter has the following attributes:
     * - type: should be a registered dice type (d4, d6, d8, d10, d12, d14, d16, d20, d24, d30, d100)
     * - labels: contains either strings (Unicode) or a path to a texture (png, gif, jpg, webp). The texture file size should be 256x256.
     * - system: should be a system ID previously registered.
     * - colorset (optional): the name of a colorset (either a custom one or from the DsN colorset list).
     * - font (optional): the name of the font family. This can be a Webfont too (e.g., Arial, monospace, etc). This setting overwrites the colorset font setting.
     * - fontScale (optional): the scale of the font size (default: 1). This setting overwrites the colorset fontScale setting.
     * - bumpMaps (optional): an array of bumpMap textures that should follow the exact same order as labels.
     * - values (optional): an object with the min and max value on the die.
     * - emissiveMaps (optional): an array of emissive textures that should follow the exact same order as labels.
     * - emissive (optional): the color of the light (hex code) emitted by the dice. Default: 0x000000 (no light).
     * - atlas (optional): a TexturePacker JSON spritesheet that contains labels/bumps/emissiveMaps for this dice preset. Can be used for multiple types to create a single spritesheet for a full dice set.
     */
    addDicePreset: (
        dice: DiceSoNicePreset,
        shape?: DiceSoNiceDieType,
    ) => void;

    /**
     * Get loaded Dice So Nice systems and their registered dice presets.
     */
    getLoadedDiceSystems: () => Map<string, DiceSoNiceSystem>;
};

const D6_DIE_TYPE = 'd6';
const SR5_DIE_TYPE = `d${SR5Die.DENOMINATION}` as const;

/**
 * Clone a loaded `d6` Dice So Nice preset into an SR5 `ds` preset.
 *
 * The cloned preset keeps the original asset references and presentation
 * settings, but changes the die type to `ds` so SR5 rolls continue to use
 * their own denomination and any `ds`-specific effects keep working.
 */
export function mirrorD6Preset(source: DiceSoNicePreset, system: string): DiceSoNicePreset {
    const preset = foundry.utils.deepClone(source);
    preset.type = SR5_DIE_TYPE;
    preset.system = system;
    return preset;
}

/**
 * Build SR5 `ds` presets for every loaded Dice So Nice system that exposes a
 * `d6` preset.
 *
 * Systems without a `d6` entry are ignored. The returned presets are meant to
 * be re-registered with Dice So Nice during `diceSoNiceReady` so the SR5 `ds`
 * die can use the same visual systems as `d6`.
 */
export function mirrorD6Presets(systems: Map<string, DiceSoNiceSystem>): DiceSoNicePreset[] {
    const presets: DiceSoNicePreset[] = [];

    for (const [system, diceSystem] of systems) {
        const d6Preset = diceSystem.dice.get(D6_DIE_TYPE);
        if (!d6Preset) continue;

        presets.push(mirrorD6Preset(d6Preset, system));
    }

    return presets;
}

export function initDiceSoNice() {
    Hooks.once('diceSoNiceReady', (dice3d) => {
        if (!dice3d) return;

        for (const preset of mirrorD6Presets(dice3d.getLoadedDiceSystems())) {
            dice3d.addDicePreset(preset, D6_DIE_TYPE);
        }
    });
}
