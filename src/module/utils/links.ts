import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";

/**
 * Utils used for opening links
 */

export class LinksHelpers {
    /**
     * Determine if given string contains a url pattern.
     * 
     * @param candidate The string that might contain a url
     * @returns true, when candidate contains a url pattern
     */
    static isURL(candidate: string | undefined): boolean {
        if (!candidate) return false;
        return candidate.startsWith('http') || candidate.startsWith('https');
    }
    /**
     * Determine if given string contains a valid uuid pattern.
     * 
     * foundry.utils.parseUuid throws an error when the uuid is invalid.
     * 
     * @param candidate  
     * @returns true, when candidate contains a valid uuid pattern
     */
    static isUuid(candidate: string | undefined) {
        if (!candidate) return false;
        try {
            // @ts-expect-error // TODO: foundry-vtt-types v10
            foundry.utils.parseUuid(candidate);
        } catch {
            return false;
        }
        
        return true;
    }

    /**
     * Resolve given uuid for better handling for different document types.
     * @param source 
     */
    static async resolveUuid(source: string) {
        // @ts-expect-error // parseUuid is not defined in the @league-of-foundry-developers/foundry-vtt-types package
        const resolvedUuid = foundry.utils.parseUuid(source);

        const uuid = resolvedUuid.uuid.split('#')[0];
        const anchor = resolvedUuid.uuid.split('#')[1];

        const document = await fromUuid(uuid);
        
        return { document, resolvedUuid, anchor }
    }

    /**
     * Use the items source field to open it as another browser tab.
     * 
     * This is meant to allow for wikis to be used as sources.
     */
    static openSourceURL(source: string | undefined) {
        if (source === '') {
            ui.notifications?.error('SR5.SourceFieldEmptyError', { localize: true });
        }

        window.open(source);
    }

    /**
     * Use the items source field to try matching it against a PDF document and display that within FoundryVTT.
     */
    static openSourcePDF(source: string | undefined) {
        // Check for pdfpager module hook: https://github.com/farling42/fvtt-pdf-pager
        if (!ui['pdfpager']) {
            ui.notifications?.warn('SR5.DIALOG.MissingModuleContent', { localize: true });
            return;
        }

        if (!source) {
            ui.notifications?.error('SR5.SourceFieldEmptyError', { localize: true });
            return;
        }

        const [code, page] = source.split(' ');

        //@ts-expect-error 
        ui.pdfpager.openPDFByCode(code, { page: parseInt(page) });
    }

    /**
     * Open the document associated with the given uuid.
     * 
     * @param source 
     */
    static async openSourceByUuid(source: string|undefined) {
        if (!source) return;
        const { document, resolvedUuid, anchor } = await LinksHelpers.resolveUuid(source);

        if (!document) {
            ui.notifications?.error('SR5.SourceFieldEmptyError', { localize: true });
            return;
        }

        try {
            if (document instanceof SR5Item || document instanceof SR5Actor || document instanceof JournalEntry) {
                document.sheet?.render(true);
                // @ts-expect-error TODO: foundry-vtt-types v10
            } else if (document instanceof JournalEntryPage) {
                document.parent.sheet.render(true, { pageId: document.id, anchor: anchor ?? undefined });
            } else {
                ui.notifications?.error(`The document has no associated sheet.`);
            }
        } catch (error) {
            ui.notifications?.error(`Error opening the sheet for UUID: ${resolvedUuid.uuid}`, error);
        }
    }

    /**
     * Use the items source field and try different means of opening it.
     */
    static async openSource(source: string | undefined) {
        if (LinksHelpers.isURL(source)) {
            return LinksHelpers.openSourceURL(source);
        }
        if (LinksHelpers.isUuid(source)) {
            return await LinksHelpers.openSourceByUuid(source);
        }
        
        LinksHelpers.openSourcePDF(source);
    }
}