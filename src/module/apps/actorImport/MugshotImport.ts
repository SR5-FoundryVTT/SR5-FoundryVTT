import { ImportHelper as IH } from "../itemImport/helper/ImportHelper";
import { ActorSchema } from "./ActorSchema";

const FilePicker = foundry.applications.apps.FilePicker.implementation;

/**
 * Handles importing Chummer mugshots into Foundry world data.
 */
export class MugshotImport {
    private static readonly MUGSHOT_EXTENSION = "jpg";
    private static readonly MUGSHOT_MIME_TYPE = "image/jpeg";
    private static readonly MUGSHOT_FOLDER_SUFFIX = "mugshots";

    /**
     * Processes Chummer mugshot data and uploads images to the Foundry server,
     * associating the main mugshot with the actor's profile.
     */
    static async importImages(chummerData: ActorSchema, actorName: string): Promise<string[]> {
        const mainMugshot = chummerData.mainmugshotbase64?.trim() ?? "";
        const extraMugshots = IH.getArray(chummerData.othermugshots?.mugshot)
            .map((entry) => entry?.stringbase64?.trim() ?? "")
            .filter((entry): entry is string => entry.length > 0);
        if (!mainMugshot && extraMugshots.length === 0) return [];

        try {
            if (!game.user?.can("FILES_UPLOAD")) {
                throw new Error("Missing FILES_UPLOAD permission");
            }

            const folderPath = `worlds/${game.world.id}/${this.MUGSHOT_FOLDER_SUFFIX}`;
            await this.ensureDirectoryPath(folderPath);

            const timestamp = Date.now();
            const randomId = foundry.utils.randomID();
            const sluggedName = IH.formatAsSlug(actorName) || "actor";
            const fileNameBase = `${sluggedName}-${timestamp}-${randomId}`;
            const imagePaths: string[] = [];

            if (mainMugshot) {
                const mainFileName = `${fileNameBase}-main.${this.MUGSHOT_EXTENSION}`;
                imagePaths.push(await this.uploadBase64Image(mainMugshot, folderPath, mainFileName));
            }

            for (const [index, mugshot] of extraMugshots.entries()) {
                const extraFileName = `${fileNameBase}-extra-${index + 1}.${this.MUGSHOT_EXTENSION}`;
                imagePaths.push(await this.uploadBase64Image(mugshot, folderPath, extraFileName));
            }

            return imagePaths;
        } catch (error) {
            console.warn(`Shadowrun 5e | Mugshot import failed for ${actorName}`, error);
            ui.notifications?.warn(`Shadowrun 5e | Mugshot import failed for ${actorName}.`);
            return [];
        }
    }

    private static async ensureDirectoryPath(path: string): Promise<void> {
        const parts = path.split("/").filter(Boolean);
        let currentPath = "";

        for (const part of parts) {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            try {
                await FilePicker.createDirectory("data", currentPath);
            } catch (error) {
                if (!String(error).toLowerCase().includes("eexist")) {
                    throw error;
                }
            }
        }
    }

    private static async uploadBase64Image(
        source: string,
        folderPath: string,
        fileName: string,
    ): Promise<string> {
        const payload = source.trim().replace(/^data:[^;]+;base64,/i, "").replace(/\s+/g, "");
        if (!payload) throw new Error("Mugshot payload was empty");

        const byteData = Uint8Array.from(atob(payload), char => char.charCodeAt(0));
        const file = new File([byteData.buffer], fileName, { type: this.MUGSHOT_MIME_TYPE });

        const response = await FilePicker.upload("data", folderPath, file, {}, { notify: false });
        if (!response || response.status !== 'success' || !response.path) {
            throw new Error(`Upload failed for ${fileName}`);
        }

        return response.path;
    }
}
