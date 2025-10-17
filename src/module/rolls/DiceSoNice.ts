import { SR5Die } from "./SR5Die";
import { FLAGS, SYSTEM_NAME } from "../constants";

/*
 * Interface to interact with Dice So Nice module.
 * https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/blob/master/module/Dice3D.js
 */
export interface DiceSoNice {
    /**
     * Show the 3D Dice animation for the Roll made by the User.
     *
     * @param roll an instance of Roll class to show 3D dice animation.
     * @param user the user who made the roll (game.user by default).
     * @param synchronize if the animation needs to be sent and played for each players (true/false).
     * @param users list of users or userId who can see the roll, leave it empty if everyone can see.
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
        users: User[] | null,
        blind: boolean,
        messageID?: string,
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
        dice: {
            type: `d${string}`,
            labels: string[],
            system: string,
            colorset?: string,
            font?: string,
            fontScale?: number | Record<string, number>,
            bumpMaps?: string[],
            values?: { min: number, max: number },
            emissiveMaps?: string[],
            emissive?: string,
            atlas?: object
        },
        shape?: `d${string}`,
    ) => void;
};

export function initDiceSoNice() {
    Hooks.once('diceSoNiceReady', (dice3d) => {
        if (!dice3d) return;
        const rawFaces = game.settings.get(SYSTEM_NAME, FLAGS.DieFaceLabels);
        const parts = rawFaces.split(',').map(s => s.trim());
        const faces = Array.from({ length: 6 }, (_, i) =>
            parts[i] !== undefined ? parts[i] : String(i + 1)
        );

        dice3d.addDicePreset({
            type: `d${SR5Die.DENOMINATION}`,
            labels: faces,
            system: 'standard'
        }, 'd6');
    });
}
